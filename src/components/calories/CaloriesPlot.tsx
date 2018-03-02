import {CaloriesState} from "../../state";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as Plot from 'react-plotly.js'
import * as $ from 'jquery';

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

type State = {
    width: number;
    height: number;
}

export class CaloriesPlot extends React.Component<Props, State> {
    state = {
        width: undefined,
        height: undefined
    }

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
            showlegend: false,
            title: 'Calories Per Day',
            width: this.state.width,
            height: this.state.height,
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

    componentDidMount(){
        this.fitWidth();
        window.addEventListener('resize', this.fitWidth);
    }

    componentWillUnmount(){
        window.removeEventListener('resize', this.fitWidth);
    }

    componentDidUpdate(){
        this.fitWidth();
    }


    shouldComponentUpdate(nextProps: Props, nextState){
        if(nextProps.caloriesState !== this.props.caloriesState){
            return true;
        }
        if(this.state !== nextState){
            return true;
        }
        return false;
    }

    fitWidth = () => {
        const parent = $(ReactDOM.findDOMNode(this));
        const width = parent.width();
        const height = parent.height();
        if(width !== this.state.width || height !== this.state.height){
            this.setState({
                width,
                height
            });
        }
    }
}
