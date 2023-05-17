import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "highcharts/modules/series-label";
import "highcharts/modules/exporting";

require("highcharts/highcharts-more")(Highcharts);

const PolarGraph = ({ scores }: { scores: number[] }) => {
  const options = {
    chart: {
      polar: true,
      type: "area",
    },

    title: {
      text: "Discussion Score Details",
    },

    pane: {
      size: "90%",
    },

    xAxis: {
      categories: [
        "Clarity",
        "Relevance",
        "Depth",
        "Open-mindedness",
        "Respectful tone",
        "Active listening",
        "Constructive criticism",
        "Balance",
        "Engagement",
        "Progress",
      ],
      tickmarkPlacement: "on",
      lineWidth: 0,
    },

    yAxis: {
      gridLineInterpolation: "polygon",
      lineWidth: 0,
      min: 0,
      max: 10,
    },

    tooltip: {
      shared: true,
      pointFormat:
        '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/>',
    },

    series: [
      {
        name: "Score",
        data: scores,
        pointPlacement: "on",
      },
    ],
  };

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default PolarGraph;