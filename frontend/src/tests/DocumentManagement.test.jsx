import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { SocketProvider } from '../contexts/SocketContext';
import DocumentManagement from '../components/documents/DocumentManagement';

// Mock API
jest.mock('../utils/api', () => ({
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn()
}));

// Mock Socket.IO
jest.mock('socket.io-client', () => ({
    io: jest.fn(() => ({
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn()
    }))
}));

const MockedDocumentManagement = () => (
    <BrowserRouter>
        <AuthProvider>
            <SocketProvider>
                <DocumentManagement />
            </SocketProvider>
        </AuthProvider>
    </BrowserRouter>
);

describe('DocumentManagement Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock successful API responses
        const mockApi = require('../utils/api');
        mockApi.get.mockResolvedValue({
            data: {
                success: true,
                data: {
                    documents: [
                        {
                            _id: '1',
                            documentType: 'Aadhar Card',
                            documentName: 'Test Document 1',
                            status: 'pending',
                            uploadedAt: '2023-01-01T00:00:00Z'
                        },
                        {
                            _id: '2',
                            documentType: 'PAN Card',
                            documentName: 'Test Document 2',
                            status: 'approved',
                            uploadedAt: '2023-01-02T00:00:00Z'
                        }
                    ]
                }
            }
        });
    });

    it('renders document management interface', async () => {
        render(<MockedDocumentManagement />);

        await waitFor(() => {
            expect(screen.getByText(/document management/i)).toBeInTheDocument();
            expect(screen.getByText(/upload document/i)).toBeInTheDocument();
        });
    });

    it('displays documents list', async () => {
        render(<MockedDocumentManagement />);

        await waitFor(() => {
            expect(screen.getByText(/aadhar card/i)).toBeInTheDocument();
            expect(screen.getByText(/pan card/i)).toBeInTheDocument();
        });
    });

    it('shows upload modal when upload button is clicked', async () => {
        render(<MockedDocumentManagement />);

        const uploadButton = screen.getByText(/upload document/i);
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(screen.getByText(/upload new document/i)).toBeInTheDocument();
        });
    });

    it('validates file selection', async () => {
        render(<MockedDocumentManagement />);

        const uploadButton = screen.getByText(/upload document/i);
        fireEvent.click(uploadButton);

        await waitFor(() => {
            const submitButton = screen.getByRole('button', { name: /upload/i });
            fireEvent.click(submitButton);

            expect(screen.getByText(/please select a file/i)).toBeInTheDocument();
        });
    });

    it('validates document type selection', async () => {
        render(<MockedDocumentManagement />);

        const uploadButton = screen.getByText(/upload document/i);
        fireEvent.click(uploadButton);

        await waitFor(() => {
            const fileInput = screen.getByLabelText(/select file/i);
            const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
            fireEvent.change(fileInput, { target: { files: [file] } });

            const submitButton = screen.getByRole('button', { name: /upload/i });
            fireEvent.click(submitButton);

            expect(screen.getByText(/please select document type/i)).toBeInTheDocument();
        });
    });

    it('handles successful document upload', async () => {
        const mockApi = require('../utils/api');
        mockApi.post.mockResolvedValueOnce({
            data: {
                success: true,
                message: 'Document uploaded successfully'
            }
        });

        render(<MockedDocumentManagement />);

        const uploadButton = screen.getByText(/upload document/i);
        fireEvent.click(uploadButton);

        await waitFor(() => {
            const fileInput = screen.getByLabelText(/select file/i);
            const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
            fireEvent.change(fileInput, { target: { files: [file] } });

            const documentTypeSelect = screen.getByLabelText(/document type/i);
            fireEvent.change(documentTypeSelect, { target: { value: 'Aadhar Card' } });

            const documentNameInput = screen.getByLabelText(/document name/i);
            fireEvent.change(documentNameInput, { target: { value: 'Test Document' } });

            const submitButton = screen.getByRole('button', { name: /upload/i });
            fireEvent.click(submitButton);

            expect(mockApi.post).toHaveBeenCalled();
        });
    });

    it('handles upload error', async () => {
        const mockApi = require('../utils/api');
        mockApi.post.mockRejectedValueOnce({
            response: {
                data: {
                    success: false,
                    message: 'Upload failed'
                }
            }
        });

        render(<MockedDocumentManagement />);

        const uploadButton = screen.getByText(/upload document/i);
        fireEvent.click(uploadButton);

        await waitFor(() => {
            const fileInput = screen.getByLabelText(/select file/i);
            const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
            fireEvent.change(fileInput, { target: { files: [file] } });

            const documentTypeSelect = screen.getByLabelText(/document type/i);
            fireEvent.change(documentTypeSelect, { target: { value: 'Aadhar Card' } });

            const documentNameInput = screen.getByLabelText(/document name/i);
            fireEvent.change(documentNameInput, { target: { value: 'Test Document' } });

            const submitButton = screen.getByRole('button', { name: /upload/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
            });
        });
    });

    it('filters documents by status', async () => {
        render(<MockedDocumentManagement />);

        await waitFor(() => {
            const filterSelect = screen.getByLabelText(/filter by status/i);
            fireEvent.change(filterSelect, { target: { value: 'approved' } });

            expect(screen.getByText(/pan card/i)).toBeInTheDocument();
            expect(screen.queryByText(/aadhar card/i)).not.toBeInTheDocument();
        });
    });

    it('shows document status badges', async () => {
        render(<MockedDocumentManagement />);

        await waitFor(() => {
            expect(screen.getByText(/pending/i)).toBeInTheDocument();
            expect(screen.getByText(/approved/i)).toBeInTheDocument();
        });
    });

    it('handles document deletion', async () => {
        const mockApi = require('../utils/api');
        mockApi.delete.mockResolvedValueOnce({
            data: {
                success: true,
                message: 'Document deleted successfully'
            }
        });

        render(<MockedDocumentManagement />);

        await waitFor(() => {
            const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
            fireEvent.click(deleteButtons[0]);

            expect(mockApi.delete).toHaveBeenCalled();
        });
    });

    it('shows loading state during upload', async () => {
        const mockApi = require('../utils/api');
        mockApi.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

        render(<MockedDocumentManagement />);

        const uploadButton = screen.getByText(/upload document/i);
        fireEvent.click(uploadButton);

        await waitFor(() => {
            const fileInput = screen.getByLabelText(/select file/i);
            const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
            fireEvent.change(fileInput, { target: { files: [file] } });

            const documentTypeSelect = screen.getByLabelText(/document type/i);
            fireEvent.change(documentTypeSelect, { target: { value: 'Aadhar Card' } });

            const documentNameInput = screen.getByLabelText(/document name/i);
            fireEvent.change(documentNameInput, { target: { value: 'Test Document' } });

            const submitButton = screen.getByRole('button', { name: /upload/i });
            fireEvent.click(submitButton);

            expect(screen.getByText(/uploading/i)).toBeInTheDocument();
        });
    });
});
