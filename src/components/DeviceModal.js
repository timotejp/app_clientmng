import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaSave } from 'react-icons/fa';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${props => props.theme.shadows.xl};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ModalTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.lightGray};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  background-color: ${props => props.theme.colors.white};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary}20;
  }

  &:invalid {
    border-color: ${props => props.theme.colors.error};
  }
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  background-color: ${props => props.theme.colors.white};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  background-color: ${props => props.theme.colors.white};
  min-height: 80px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary}20;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.lg};
`;

const Button = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  transition: background-color 0.2s ease;

  ${props => props.primary ? `
    background-color: ${props.theme.colors.primary};
    color: ${props.theme.colors.white};

    &:hover {
      background-color: ${props.theme.colors.primaryDark};
    }
  ` : `
    background-color: ${props.theme.colors.lightGray};
    color: ${props.theme.colors.text};

    &:hover {
      background-color: ${props.theme.colors.border};
    }
  `}
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-top: ${props => props.theme.spacing.xs};
`;

const deviceTypes = [
  'Klima (AC)',
  'Toplotna črpalka',
  'Plinski gorilnik',
  'Olgov gorilnik',
  'Telefon',
  'Računalnik',
  'TV',
  'Hladilnik',
  'Pralni stroj',
  'Sušilni stroj',
  'Drugo'
];

const DeviceModal = ({ device, clients, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    stranka_id: '',
    tip_opreme: '',
    znamka: '',
    model: '',
    serijska_stevilka: '',
    datum_nakupa: '',
    garancija_do: '',
    opombe: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (device) {
      setFormData({
        stranka_id: device.stranka_id || '',
        tip_opreme: device.tip_opreme || '',
        znamka: device.znamka || '',
        model: device.model || '',
        serijska_stevilka: device.serijska_stevilka || '',
        datum_nakupa: device.datum_nakupa || '',
        garancija_do: device.garancija_do || '',
        opombe: device.opombe || ''
      });
    }
  }, [device]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tip_opreme.trim()) {
      newErrors.tip_opreme = 'Tip opreme je obvezen';
    }

    if (!formData.znamka.trim()) {
      newErrors.znamka = 'Znamka je obvezna';
    }

    if (!formData.stranka_id) {
      newErrors.stranka_id = 'Stranka je obvezna';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Napaka pri shranjevanju:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {device ? 'Uredi opremo' : 'Dodaj novo opremo'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="stranka_id">Stranka *</Label>
            <Select
              id="stranka_id"
              name="stranka_id"
              value={formData.stranka_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Izberite stranko</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.ime} {client.priimek}
                </option>
              ))}
            </Select>
            {errors.stranka_id && <ErrorMessage>{errors.stranka_id}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="tip_opreme">Tip opreme *</Label>
            <Select
              id="tip_opreme"
              name="tip_opreme"
              value={formData.tip_opreme}
              onChange={handleInputChange}
              required
            >
              <option value="">Izberite tip opreme</option>
              {deviceTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
            {errors.tip_opreme && <ErrorMessage>{errors.tip_opreme}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="znamka">Znamka *</Label>
            <Input
              type="text"
              id="znamka"
              name="znamka"
              value={formData.znamka}
              onChange={handleInputChange}
              required
            />
            {errors.znamka && <ErrorMessage>{errors.znamka}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="model">Model</Label>
            <Input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="serijska_stevilka">Serijska številka</Label>
            <Input
              type="text"
              id="serijska_stevilka"
              name="serijska_stevilka"
              value={formData.serijska_stevilka}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="datum_nakupa">Datum nakupa</Label>
            <Input
              type="date"
              id="datum_nakupa"
              name="datum_nakupa"
              value={formData.datum_nakupa}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="garancija_do">Garancija do</Label>
            <Input
              type="date"
              id="garancija_do"
              name="garancija_do"
              value={formData.garancija_do}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="opombe">Opombe</Label>
            <TextArea
              id="opombe"
              name="opombe"
              value={formData.opombe}
              onChange={handleInputChange}
              placeholder="Dodatne opombe o opremi..."
            />
          </FormGroup>

          <ButtonGroup>
            <Button type="button" onClick={onClose}>
              Prekliči
            </Button>
            <Button type="submit" primary disabled={loading}>
              <FaSave />
              {loading ? 'Shranjujem...' : 'Shrani'}
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default DeviceModal;
