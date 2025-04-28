import React, { useRef, useEffect, useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
} from "@mui/material";

const LiveVideo = () => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (!mounted) return;
        const vid = videoRef.current;
        vid.srcObject = stream;
        vid.onloadedmetadata = () => {
          vid.play();
          setPlaying(true);
        };
      })
      .catch((err) => {
        console.error(err);
        setError("Webcam access denied.");
      });
    return () => {
      mounted = false;
      const vid = videoRef.current;
      if (vid?.srcObject) {
        vid.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const toggle = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (playing) vid.pause();
    else vid.play();
    setPlaying(!playing);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Live Video
      </Typography>
      <Card>
        <CardContent sx={{ textAlign: "center" }}>
          {error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                borderRadius: 8,
                background: "#000",
                objectFit: "cover",
              }}
            />
          )}
          <Button sx={{ mt: 2 }} variant="contained" onClick={toggle}>
            {playing ? "Pause Video" : "Play Video"}
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LiveVideo;
