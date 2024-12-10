import { Box, Chip, Typography } from "@mui/material";

const UsernameAndOPChip = ({ username, isOP }) => (
  <Box sx={{ display: "flex", alignItems: "center" }}>
    <Typography variant="body2">{username}</Typography>
    {isOP && (
      <Chip
        sx={{ marginLeft: "0.5rem" }}
        label="OP"
        variant="outlined"
        size="small"
      />
    )}
  </Box>
);

export default UsernameAndOPChip;
