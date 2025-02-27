import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { useSearch } from "../contexts/SearchContext";
import ChangeWarning from "./ChangeWarning";
import { useAffectedItems } from "../contexts/useAffectedItems";
import { useDefinitions } from "../contexts/useDefinitions";
import { useFormats } from "../contexts/useFormats";

const DefinitionDialog = ({
  mode,
  open,
  onClose,
  editedDefinition,
}) => {
  const [definition, setDefinition] = useState({
    name: "",
    format: "",
    description: "",
  });
  const { formats, fetchFormats } = useFormats();
  const options = useMemo(() => Object.keys(formats), [formats]);
  const [namingConvention, setNamingConvention] = useState("");
  const [namingConventionError, setNamingConventionError] = useState("");
  const { logout } = useAuth();
  const { setRefreshSearchables } = useSearch();
  const { fetchDefinitions } = useDefinitions();
  const { affected, fetchAffectedItems } = useAffectedItems();
  const token = localStorage.getItem("token");

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
      console.error("Error fetching naming convention:");
      console.debug(error);
      enqueueSnackbar("Error fetching naming convention", { variant: "error" });
    }
  }, [logout]);

  // When the dialog opens or editedDefinition changes, initialize the form.
  useEffect(() => {
    fetchFormats();
    fetchNamingConvention();
    if (editedDefinition) {
      setDefinition(editedDefinition);
      fetchAffectedItems({ name: editedDefinition.name, type: 'definition' });
    } else {
      setDefinition({ name: "", format: "", description: "" });
    }
  }, [editedDefinition, fetchFormats, fetchNamingConvention, fetchAffectedItems]);

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
      const url = `${process.env.REACT_APP_API_URL}/api/definitions${mode === "add" ? "" : `/${definition.name}`
        }`;
      const method = mode === "add" ? "post" : "put";
      await axios[method](url, definition, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDefinitions();
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
  }, [definition, mode, fetchDefinitions, onClose, setRefreshSearchables, validateNamingConvention, logout, token]);

  const handleCancel = () => {
    // setDefinition({ name: "", format: "", description: "" });
    onClose();
  };

  const handleNameChange = (e) => {
    setDefinition((prev) => ({ ...prev, name: e.target.value }));
    setNamingConventionError("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "add" ? "Add Definition" : "Edit Definition"}
        {affected && <ChangeWarning items={affected} level="warning" />}
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
          options={options}
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
