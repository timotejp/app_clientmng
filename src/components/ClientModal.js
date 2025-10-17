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

const ClientModal = ({ client, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    ime: '',
    priimek: '',
    naslov: '',
    telefon: '',
    email: '',
    opombe: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        ime: client.ime || '',
        priimek: client.priimek || '',
        naslov: client.naslov || '',
        telefon: client.telefon || '',
        email: client.email || '',
        opombe: client.opombe || ''
      });
    }
  }, [client]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ime.trim()) {
      newErrors.ime = 'Ime je obvezno';
    }

    if (!formData.priimek.trim()) {
      newErrors.priimek = 'Priimek je obvezen';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Neveljaven e-poštni naslov';
    }

    if (formData.telefon && !/^[\+]?[0-9\s\-\(\)]+$/.test(formData.telefon)) {
      newErrors.telefon = 'Neveljavna telefonska številka';
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
            {client ? 'Uredi stranko' : 'Dodaj novo stranko'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="ime">Ime *</Label>
            <Input
              type="text"
              id="ime"
              name="ime"
              value={formData.ime}
              onChange={handleInputChange}
              required
            />
            {errors.ime && <ErrorMessage>{errors.ime}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="priimek">Priimek *</Label>
            <Input
              type="text"
              id="priimek"
              name="priimek"
              value={formData.priimek}
              onChange={handleInputChange}
              required
            />
            {errors.priimek && <ErrorMessage>{errors.priimek}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">E-pošta</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="telefon">Telefon</Label>
            <Input
              type="tel"
              id="telefon"
              name="telefon"
              value={formData.telefon}
              onChange={handleInputChange}
            />
            {errors.telefon && <ErrorMessage>{errors.telefon}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="naslov">Naslov</Label>
            <Input
              type="text"
              id="naslov"
              name="naslov"
              value={formData.naslov}
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
              placeholder="Dodatne opombe o stranki..."
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

export default ClientModal;
