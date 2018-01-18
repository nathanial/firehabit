import {CaloriesState} from "../../state";
import * as React from 'react';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as Plot from 'react-plotly.js'

type Props = {
    caloriesState: CaloriesState;
}

export class WeightPlot extends React.PureComponent<Props,{}>{
    render(){
        var months = this.getMonths();

        const data = _.map(_.keys(months), (month) => {
            const days = months[month];
            return {
                type: 'box',
                name: month,
                y: _.filter(_.map(days, d => d.weight), x => x > 0)
            };
        });
        const layout = {
            width: 728,
            height: 500,
            showlegend: false,
            title: 'Weight',
            margin: {
                l: 50,
                r: 0,
                b: 50,
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

    private getMonths = () => {
        const days = this.props.caloriesState.days;
        const months = _.groupBy(days, (day: Day) => {
            return moment(day.date).format('MM/YY');
        });
        return months;
    };


}
