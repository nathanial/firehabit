import * as React from 'react';
import ChartistGraph from 'react-chartist';
import * as Chartist from 'chartist';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as LPF from 'lpf';

type Props = {
    days: Day[];
}

type WeightSample = {
    date: string; 
    weight: number;
}

export default class WeightGraph extends React.PureComponent<Props,{}> {
    render() {
        let days = this.getDays();
        const data = {
            labels: _.map(days, d => d.date),
            series: [
                _.map(days, d => d.weight)
            ]
        };
        const options = {
            type: Chartist.AutoScaleAxis,
            axisX: {
                labelInterpolationFnc: function(value, index) {
                    return (new Date(value)).toLocaleDateString();
                }
            },
        };
        const type = 'Line'
        return (
            <div className="weight-graph">
                <ChartistGraph data={data} options={options} type={type} />
                {days.length <= 1 && <h1>No Data</h1>}
            </div>
        );
    }

    private getDays() {
        return this.downSample(5);
    }

    private downSample(count: number): WeightSample[] {
        const days = this.filledInDays();
        if(days.length === 0){
            return [];
        } else if(days.length === 1){
            return [{date: days[0].date.toString(), weight: days[0].weight}];
        } else {
            const start = _.first(days).date;
            const end = _.last(days).date;
            const range = Math.floor(moment.duration(moment(end).diff(start)).asDays());
            const normalizedDays:WeightSample[] = [];
            const startDay = moment(start).startOf('day');
            const endDay = moment(end).startOf('day');
            const samples:WeightSample[] = [];
            for(let i = 0; i < range; i++){
                const date = moment(start).add(i, 'days');
                samples.push({
                    date: date.toString(),
                    weight: this.findValue(date)
                });
            }
            const values = _.map(samples, s => s.weight);
            LPF.smoothing = 0.1;
            const smoothed = LPF.smoothArray(values);
            for(let i = 0; i < range; i++){
                samples[i].weight = smoothed[i];
            }
            const step = Math.ceil(days.length / count);

            const downsampled: WeightSample[] = [];
            for(let i = samples.length - 1; i >= 0; i -= step) {
                downsampled.unshift(samples[i]);
            }
            return downsampled;
        }
    }

    private findValue(date: moment.Moment): number {
        const day = this.findExactDay(date);
        if(day){
            return day.weight;
        } else {
            const nearestDayBefore = this.findNearestDayBefore(date);
            const nearestDayAfter = this.findNearestDayAfter(date);
            if(!nearestDayAfter && !nearestDayAfter){
                throw new Error('Nothing to lerp');
            }
            if(nearestDayBefore && !nearestDayAfter){
                console.warn('Couldn\'t find a day after');
                return nearestDayBefore.weight;
            }
            if(!nearestDayBefore && nearestDayAfter){
                console.warn('Couldn\'t find a day before');
                return nearestDayAfter.weight;
            }
            return this.lerp(date, nearestDayBefore, nearestDayAfter);
        }
    }
    
    private lerp(date: moment.Moment, before: Day, after: Day): number {
        const beforeDate = moment(before.date);
        const afterDate = moment(after.date);
        const dateRange = afterDate.unix() - beforeDate.unix();
        const weightRange = after.weight - before.weight;
        const fraction = (date.unix() - beforeDate.unix()) / dateRange;
        return before.weight + fraction * weightRange;
    }

    private findNearestDayBefore(date: moment.Moment): Day {
        const days = this.filledInDays();
        let index = _.findIndex(days, day => moment(day.date) >= date);
        if(index > 0){
            return days[index-1];
        }
    }

    private findNearestDayAfter(date: moment.Moment): Day {
        const days = this.filledInDays();
        let index = _.findIndex(days, day => moment(day.date) > date);
        if(index !== -1){
            return days[index];
        }
    }

    private findExactDay(date: moment.Moment): Day {
        return _.find(this.filledInDays(), day => moment(day.date).startOf('day').toString() === date.startOf('day').toString());
    }

    private filledInDays(): Day[] {
        return _.filter(this.props.days, day => {
            return !_.isUndefined(day.weight) && day.weight > 0;
        });
    }
}