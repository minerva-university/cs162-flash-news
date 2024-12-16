// Component adapted from: https://mui.com/material-ui/react-select/#chip
import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name, selected, theme) {
  return {
    fontWeight: selected.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

export default function MultipleSelectChip({
  id,
  label,
  options = [],
  max = -1,
  onChange,
  sx,
  alreadySelected = [],
}) {
  const theme = useTheme();
  const [selected, setSelected] = React.useState(alreadySelected);

  // Handle change (add/removal) of selected items
  const handleChange = (event) => {
    const {
      target: { value },
    } = event;

    // Limit the number of selected items
    if (max > 0 && value.length > max) return;

    // Account for potential autofill where we will get a stringified value.
    const newSelected = typeof value === "string" ? value.split(",") : value;
    setSelected(newSelected);

    // Notify parent component of change
    if (onChange) onChange(newSelected);
  };

  return (
    <FormControl sx={{ ...sx, width: "100%" }}>
      <InputLabel id={`${id}-label`}>{label}</InputLabel>
      <Select
        labelId={`${id}-label`}
        id={id}
        multiple
        value={selected}
        onChange={handleChange}
        input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
        // Render the selected items as chips
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((value) => (
              <Chip key={value} label={value} />
            ))}
          </Box>
        )}
        MenuProps={MenuProps}
      >
        {options.length > 0 ? (
          options.map((option) => (
            <MenuItem
              key={option}
              value={option}
              style={getStyles(option, selected, theme)}
            >
              {option}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No collections available</MenuItem>
        )}
      </Select>
    </FormControl>
  );
}
