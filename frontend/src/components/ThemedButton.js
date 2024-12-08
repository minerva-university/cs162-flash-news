import { Button } from "@mui/material";

export default function ThemedButton(props) {
  return (
    <Button
      sx={{
        ...props.sx,
        backgroundColor: "#5F848C",
        color: "#FCF8EC",
        fontWeight: "bold",
        borderRadius: "0 0 8px 8px",
        "&:hover": {
          backgroundColor: "#266a7a",
        },
      }}
      {...props}
    />
  );
}
