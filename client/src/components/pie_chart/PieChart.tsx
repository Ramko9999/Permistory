import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import ColorHash from "../../services/ColorHash";

ChartJS.register(ArcElement, Tooltip);

export type DoughnutChartProps = {
    locationData: any
  };

export const data = {
    labels: [] as any,
      datasets: [{
        label: 'My First Dataset',
        data: [] as any,
        backgroundColor: [] as any,
        hoverOffset: 4
      }]
};


export default function PieChart({locationData}:DoughnutChartProps){


    for(let d of locationData){
        console.log(d);
        data.labels.push(d.host);
        data.datasets[0].data.push(d.count);
        data.datasets[0].backgroundColor.push(ColorHash.getRGBColor(d.host))
    }



  return <Doughnut data={data} />;
}
