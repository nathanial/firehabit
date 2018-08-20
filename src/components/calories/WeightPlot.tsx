import * as $ from 'jquery';
import {CaloriesState} from "../../state";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as Plot from 'react-plotly.js'

type Props = {
    caloriesState: CaloriesState;
}

type State = {
    width: number;
    height: number;
}

export class WeightPlot extends React.Component<Props, State>{

    state = {
        width: undefined,
        height: undefined
    }

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
            showlegend: false,
            title: 'Weight',
            width: this.state.width,
            height: this.state.height,
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
