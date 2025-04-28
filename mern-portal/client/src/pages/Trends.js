import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
} from "@mui/material";
import Plot from "react-plotly.js";

const Trends = ({ username }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5001/api/trends?username=${username}`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, [username]);

  if (!data) return <Typography>Loading...</Typography>;
  const { dailyStats, overall, explanation } = data;

  // Prepare candlestick arrays
  const dates = dailyStats.map((d) => d.date);
  const opens = dailyStats.map((d) => d.q1);
  const closes = dailyStats.map((d) => d.q3);
  const lows = dailyStats.map((d) => d.min);
  const highs = dailyStats.map((d) => d.max);
  const medians = dailyStats.map((d) => d.median);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Trends
      </Typography>
      <Typography paragraph>{explanation}</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Average", value: overall.avg, color: "primary" },
          { label: "Minimum", value: overall.min, color: "secondary" },
          { label: "Maximum", value: overall.max, color: "secondary" },
          {
            label: "Status",
            value: overall.trendStatus,
            color: overall.trendStatus === "Okay" ? "success" : "error",
          },
        ].map(({ label, value, color }) => (
          <Grid item xs={6} md={3} key={label}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2">{label}</Typography>
                <Chip label={value} color={color} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Plot
            data={[
              {
                x: dates,
                open: opens,
                high: highs,
                low: lows,
                close: closes,
                type: "candlestick",
                name: "Box Plot",
                increasing: { line: { color: "#4caf50" } },
                decreasing: { line: { color: "#f44336" } },
              },
              {
                x: dates,
                y: medians,
                mode: "markers+lines",
                name: "Median",
                marker: { color: "#2196f3", size: 8 },
              },
            ]}
            layout={{
              margin: { t: 30, b: 50 },
              xaxis: { title: "Date" },
              yaxis: { title: "Heart Rate (bpm)" },
              height: 500,
            }}
            useResizeHandler
            style={{ width: "100%" }}
          />
        </CardContent>
      </Card>
    </Container>
  );
};

export default Trends;
