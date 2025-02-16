import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";
import { Autocomplete } from "@mui/material";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { useAuth } from "../contexts/AuthContext";

const DefinitionDialog = ({
  mode,
  open,
  onClose,
  editedDefinition,
  refetch,
  setRefreshSearchables,
}) => {
  const [definition, setDefinition] = useState({
    name: "",
    format: "",
    description: "",
  });
  const [formats, setFormats] = useState([]);
  const [namingConvention, setNamingConvention] = useState("");
  const [namingConventionError, setNamingConventionError] = useState("");
  const { logout } = useAuth();

  const fetchFormats = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/formats`
      );
      const formatNames = Object.keys(data).sort();
      setFormats(formatNames);
    } catch (error) {
      console.error("Error fetching formats:", error);
    }
  }, []);

  const fetchNamingConvention = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/settings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNamingConvention(data.namingConvention);
    } catch (error) {
      if (error.response?.status === 401) {
        logout({ mode: "bad_token" });
        return;
      }
      console.error("Error fetching naming convention:", error);
      enqueueSnackbar("Error fetching naming convention", { variant: "error" });
    }
  }, [logout]);

  // When the dialog opens or editedDefinition changes, initialize the form.
  useEffect(() => {
    fetchFormats();
    fetchNamingConvention();
    if (editedDefinition) {
      setDefinition(editedDefinition);
    } else {
      setDefinition({ name: "", format: "", description: "" });
    }
  }, [editedDefinition, fetchFormats, fetchNamingConvention]);

  // Validate the naming convention.
  const validateNamingConvention = useCallback(() => {
    if (!namingConvention) return true;
    const { name } = definition;
    switch (namingConvention) {
      case "snake_case":
        if (!/^[a-z0-9_]+$/.test(name)) {
          setNamingConventionError("Name must be in snake_case");
          return false;
        }
        break;
      case "camelCase":
        if (!/^[a-z]+([A-Z][a-z]*)*$/.test(name)) {
          setNamingConventionError("Name must be in camelCase");
          return false;
        }
        break;
      case "PascalCase":
        if (!/^[A-Z][a-z]+([A-Z][a-z]*)*$/.test(name)) {
          setNamingConventionError("Name must be in PascalCase");
          return false;
        }
        break;
      case "kebab-case":
        if (!/^[a-z0-9-]+$/.test(name)) {
          setNamingConventionError("Name must be in kebab-case");
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  }, [definition, namingConvention]);

  // Handle form submission.
  const handleSubmit = useCallback(async () => {
    if (!validateNamingConvention()) return;
    try {
      const token = localStorage.getItem("token");
      const url = `${process.env.REACT_APP_API_URL}/api/definitions${
        mode === "add" ? "" : `/${definition.name}`
      }`;
      const method = mode === "add" ? "post" : "put";
      await axios[method](url, definition, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refetch();
      setDefinition({ name: "", format: "", description: "" });
      onClose();
      setRefreshSearchables((prev) => prev + 1);
      enqueueSnackbar(
        `Definition ${mode === "add" ? "added" : "edited"} successfully!`,
        { variant: "success" }
      );
    } catch (error) {
      if (error.response?.status === 401) {
        logout({ mode: "bad_token" });
        return;
      } else if (error.response?.status === 409) {
        enqueueSnackbar("Definition already exists", { variant: "error" });
      } else {
        console.error(`Error ${mode === "add" ? "adding" : "editing"} definition:`, error);
        enqueueSnackbar(
          `Error ${mode === "add" ? "adding" : "editing"} definition`,
          { variant: "error" }
        );
      }
      setDefinition({ name: "", format: "", description: "" });
    }
  }, [definition, mode, refetch, onClose, setRefreshSearchables, validateNamingConvention, logout]);

  const handleCancel = () => {
    setDefinition({ name: "", format: "", description: "" });
    onClose();
  };

  const handleNameChange = (e) => {
    setDefinition((prev) => ({ ...prev, name: e.target.value }));
    setNamingConventionError("");
  };

  //TODO: add warning change near the title if refrenced by an entity or a definition
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "add" ? "Add Definition" : "Edit Definition"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please fill out the details below to {mode === "add" ? "add" : "edit"} a definition.
        </DialogContentText>
        <TextField
          label="Name"
          fullWidth
          margin="normal"
          value={definition.name}
          error={!!namingConventionError}
          helperText={namingConventionError}
          onChange={handleNameChange}
          disabled={mode === "edit"}
        />
        <Autocomplete
          options={formats}
          getOptionLabel={(option) => option}
          value={definition.format}
          onChange={(e, newValue) =>
            setDefinition((prev) => ({ ...prev, format: newValue || "" }))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Format"
              fullWidth
              margin="normal"
              placeholder="Select a format"
            />
          )}
        />
        <TextField
          label="Description"
          fullWidth
          margin="normal"
          multiline
          rows={4}
          value={definition.description}
          onChange={(e) =>
            setDefinition((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DefinitionDialog;
