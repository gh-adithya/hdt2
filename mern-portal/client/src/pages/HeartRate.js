// src/pages/HeartRate.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const HeartRate = ({ username }) => {
  const [groupedData, setGroupedData] = useState({});

  useEffect(() => {
    fetch(`http://localhost:5001/api/heartrate?username=${username}`)
      .then((res) => res.json())
      .then((arr) => {
        // parse and group by date
        const formatted = arr.map((doc) => ({
          heartRate: doc.heartRate,
          time: new Date(doc.time),
        }));
        const groups = {};
        formatted.forEach((item) => {
          const day = item.time.toISOString().split("T")[0];
          groups[day] = groups[day] || [];
          groups[day].push(item);
        });
        setGroupedData(groups);
      })
      .catch(console.error);
  }, [username]);

  const days = Object.keys(groupedData).sort();
  if (!days.length) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Heart Rate Data (Past Week)
      </Typography>

      {days.map((day) => {
        const recs = groupedData[day];
        // compute summary
        const avg = (
          recs.reduce((sum, r) => sum + r.heartRate, 0) / recs.length
        ).toFixed(1);
        const min = Math.min(...recs.map((r) => r.heartRate));
        const max = Math.max(...recs.map((r) => r.heartRate));
        // prepare chart data
        const chartData = recs.map((r) => ({
          time: r.time.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          heartRate: r.heartRate,
        }));

        return (
          <Accordion key={day}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ width: "33%", flexShrink: 0 }}>
                {day}
              </Typography>
              <Typography color="text.secondary">
                Avg: {avg} bpm | Min: {min} | Max: {max}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {/* Left: Chart */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="time"
                          interval={Math.floor(chartData.length / 6)}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis domain={["dataMin - 5", "dataMax + 5"]} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="heartRate"
                          stroke="#3f51b5"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                {/* Right: Table */}
                <Grid item xs={12} md={6}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Heart Rate (bpm)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recs.map((r, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            {r.time.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>{r.heartRate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Container>
  );
};

export default HeartRate;
