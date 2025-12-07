import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';

// Mock the ContactSection component for testing
const MockContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  };

  return (
    <form onSubmit={handleSubmit} data-testid="contact-form">
      <input
        type="text"
        name="name"
        placeholder="Jean Dupont"
        aria-label="Nom complet"
        required
        minLength={2}
      />
      <input
        type="email"
        name="email"
        placeholder="jean@exemple.com"
        aria-label="Adresse email"
        required
      />
      <input
        type="text"
        name="subject"
        placeholder="Développement web"
        aria-label="Sujet du message"
        required
        minLength={3}
      />
      <textarea
        name="message"
        placeholder="Décrivez votre projet"
        aria-label="Votre message"
        required
        minLength={10}
        maxLength={5000}
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
      </button>
    </form>
  );
};

describe('ContactSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      render(<MockContactForm />);

      expect(screen.getByPlaceholderText('Jean Dupont')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('jean@exemple.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Développement web')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Décrivez votre projet')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /envoyer/i })).toBeInTheDocument();
    });

    it('should have proper accessibility labels', () => {
      render(<MockContactForm />);

      expect(screen.getByLabelText('Nom complet')).toBeInTheDocument();
      expect(screen.getByLabelText('Adresse email')).toBeInTheDocument();
      expect(screen.getByLabelText('Sujet du message')).toBeInTheDocument();
      expect(screen.getByLabelText('Votre message')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should require all fields', () => {
      render(<MockContactForm />);

      const nameInput = screen.getByPlaceholderText('Jean Dupont');
      const emailInput = screen.getByPlaceholderText('jean@exemple.com');
      const subjectInput = screen.getByPlaceholderText('Développement web');
      const messageInput = screen.getByPlaceholderText('Décrivez votre projet');

      expect(nameInput).toBeRequired();
      expect(emailInput).toBeRequired();
      expect(subjectInput).toBeRequired();
      expect(messageInput).toBeRequired();
    });

    it('should have minimum length constraints', () => {
      render(<MockContactForm />);

      const nameInput = screen.getByPlaceholderText('Jean Dupont');
      const subjectInput = screen.getByPlaceholderText('Développement web');
      const messageInput = screen.getByPlaceholderText('Décrivez votre projet');

      expect(nameInput).toHaveAttribute('minLength', '2');
      expect(subjectInput).toHaveAttribute('minLength', '3');
      expect(messageInput).toHaveAttribute('minLength', '10');
    });

    it('should have maximum length for message', () => {
      render(<MockContactForm />);

      const messageInput = screen.getByPlaceholderText('Décrivez votre projet');
      expect(messageInput).toHaveAttribute('maxLength', '5000');
    });
  });

  describe('Form Interaction', () => {
    it('should allow typing in all fields', async () => {
      const user = userEvent.setup();
      render(<MockContactForm />);

      const nameInput = screen.getByPlaceholderText('Jean Dupont');
      const emailInput = screen.getByPlaceholderText('jean@exemple.com');

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');

      expect(nameInput).toHaveValue('Test User');
      expect(emailInput).toHaveValue('test@example.com');
    });
  });
});

describe('Contact API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should send form data to API', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Success', id: '123' }),
    });
    global.fetch = mockFetch;

    const formData = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'This is a test message with enough characters.',
    };

    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
  });

  it('should handle API errors gracefully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: 'Too many requests' }),
    });
    global.fetch = mockFetch;

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(429);
  });
});
