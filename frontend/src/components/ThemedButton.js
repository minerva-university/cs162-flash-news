import { Button } from "@mui/material";

export default function ThemedButton(props) {
  return (
    <Button
      {...props}
      sx={{
        ...props.sx,
        "&:hover": {
          backgroundColor: "#266a7a",
          color: "#F6F5EE",
        },
      }}
    />
  );
}
