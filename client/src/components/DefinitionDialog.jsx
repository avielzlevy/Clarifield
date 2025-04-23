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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
      enqueueSnackbar(t('error_fetching_naming_convention'), { variant: "error" });
    }
  }, [logout, t]);

  // When the dialog opens or editedDefinition changes, initialize the form.
  useEffect(() => {
    fetchFormats();
    fetchNamingConvention();
    if (editedDefinition && mode === "edit") {
      setDefinition(editedDefinition);
      fetchAffectedItems({ name: editedDefinition.name, type: 'definition' });
    } else {
      setDefinition({ name: "", format: "", description: "" });
    }
  }, [editedDefinition, fetchFormats, fetchNamingConvention, fetchAffectedItems, mode]);

  // Validate the naming convention.
  const validateNamingConvention = useCallback(() => {
    if (!namingConvention) return true;
    const { name } = definition;
    switch (namingConvention) {
      case "snake_case":
        if (!/^[a-z0-9_]+$/.test(name)) {
          setNamingConventionError(`${t('definitions.bad_naming_convention')} ${t('common.snake_case')}`);
          return false;
        }
        break;
      case "camelCase":
        if (!/^[a-z]+([A-Z][a-z]*)*$/.test(name)) {
          setNamingConventionError(`${t('definitions.bad_naming_convention')} ${t('common.camelCase')}`);
          return false;
        }
        break;
      case "PascalCase":
        if (!/^[A-Z][a-z]+([A-Z][a-z]*)*$/.test(name)) {
          setNamingConventionError(`${t('definitions.bad_naming_convention')} ${t('common.PascalCase')}`);
          return false;
        }
        break;
      case "kebab-case":
        if (!/^[a-z0-9-]+$/.test(name)) {
          setNamingConventionError(`${t('definitions.bad_naming_convention')} ${t('common.kebab-case')}`);
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  }, [definition, namingConvention, t]);

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
        `${t('common.definition')} ${t(`common.${mode}ed`)} ${t('common.successfully')}`,
        { variant: "success" }
      );
    } catch (error) {
      if (error.response?.status === 401) {
        logout({ mode: "bad_token" });
        return;
      } else if (error.response?.status === 409) {
        enqueueSnackbar(t('definition_already_exists'), { variant: "error" });
      } else {
        console.error(`Error ${mode === "add" ? "adding" : "editing"} definition:`, error);
        enqueueSnackbar(
          `${t('common.error')} ${t(`common.${mode}ing`)} ${t('definitions.definition')}`,
          { variant: "error" }
        );
      }
      setDefinition({ name: "", format: "", description: "" });
    }
  }, [definition, mode, fetchDefinitions, onClose, setRefreshSearchables, validateNamingConvention, logout, token, t]);

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
          {t('definitions.fill_all_fields_1')} {t(`common.${mode}`)} {t('common.definition')}.
        </DialogContentText>
        <TextField
          label={t('common.name')}
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
              label={t('common.format')}
              fullWidth
              error={mode === 'edit' && !formats[definition.format]}
              helperText={mode === 'edit' && !formats[definition.format] && `${definition.format} is not a valid format`}
              margin="normal"
              placeholder="Select a format"
            />
          )}
        />
        <TextField
          label={t('common.description')}
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
          {t('common.cancel')}
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {t('common.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DefinitionDialog;
