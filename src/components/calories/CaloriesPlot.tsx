import {CaloriesState} from "../../state";
import * as React from 'react';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as Plot from 'react-plotly.js'

type Props = {
    caloriesState: CaloriesState;
}

// smoothing whole array
function lpf(values: number[], smoothing: number){
    var value = values[0];
    for (var i = 1; i < values.length; i++){
        var currentValue = values[i];
        value += (currentValue - value) / smoothing;
        values[i] = Math.round(value);
    }
}

export class CaloriesPlot extends React.PureComponent<Props, {}> {
    render(){
        const days = this.props.caloriesState.days;
        const values = _.filter(_.map(days, d => ({date: d.date, calories: _.sumBy(d.consumed, c => parseInt(c.calories, 10))})), x => x.calories !== 0)
        const calories = _.map(values, v => v.calories);
        lpf(calories, 30.0);
        const data = [{
           type: 'line' ,
           name: 'Calories',
           x: _.map(values, v => moment(v.date).format('MM/DD')),
           y: calories
        }];
        const layout = {
            width: 728,
            height: 300,
            showlegend: false,
            title: 'Calories Per Day',
            margin: {
                l: 50,
                r: 20,
                b: 70,
                t: 70,
                pad: 0
            },
            xaxis: {
                fixedrange: true
            },
            yaxis: {
                fixedrange: true
            },
            paper_bgcolor: '#FFF',
            plot_bgcolor: '#FFF'
        };
        return (
            <Plot data={data} layout={layout} config={{displayModeBar:false, editable: false, scrollZoom: false}}/>
        );
    }
}
