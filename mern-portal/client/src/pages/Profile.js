import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
} from "@mui/material";

const Profile = ({ username }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5001/api/profile?username=${username}`)
      .then((res) => res.json())
      .then(setProfile)
      .catch(console.error);
  }, [username]);

  if (!profile) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar sx={{ width: 100, height: 100, mx: "auto", mb: 2 }}>
                {profile.name[0]}
              </Avatar>
              <Typography variant="h6">{profile.name}</Typography>
              <Typography variant="body2">Age: {profile.age}</Typography>
              <Typography variant="body2">
                DOB: {new Date(profile.dob).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contact
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography>{profile.address}</Typography>
                {/* Placeholder for extra info */}
                <Typography>Email: {username}@example.com</Typography>
                <Typography>Phone: (123) 456-7890</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
