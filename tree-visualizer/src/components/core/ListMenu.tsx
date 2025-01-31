import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

export const ListMenu = ({
  value,
  handleChange,
  optionsLength,
}: {
  value: number;
  handleChange: (e: { target: { value: number } }) => void;
  optionsLength: number;
}) => {
  return (
    <Box sx={{ width: 220 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="demo-simple-select-label">
          expansion candidates
        </InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={value}
          label="expansion candidates"
          onChange={handleChange}
        >
          <MenuItem value={-1}>Best Candidate</MenuItem>
          {Array.from({ length: optionsLength }, (_, i) => (
            <MenuItem value={i} key={i}>
              Candidate {i + 1}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
