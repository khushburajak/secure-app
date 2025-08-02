"use client"

import { useState, useEffect } from 'react';
import { authAPI } from "../services/api"
import { useToast } from "../contexts/ToastContext"
import { useAuth } from "../contexts/AuthContext"
import './TransactionHistory.css';

const TransactionsPage = () => {
    const { user } = useAuth()
    const { showToast } = useToast()

    const [transactions, setTransactions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        amount: 0,
        details: '',
    });

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await authAPI.viewTransaction();

            const transactions = response.data;

            const formattedTransactions = transactions.map(tx => ({
                ...tx,
                amount: Number(tx.amount),
                timestamp: new Date(tx.timestamp)
            }));

            setTransactions(formattedTransactions);

        } catch (error) {
            console.error('Error fetching transactions:', error);
            showToast(
                error.response?.data?.message ||
                "Failed to fetch transactions",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authAPI.createTransaction(formData);

            showToast("Transaction created successfully!", "success");
            closeModal();
            setFormData({
                amount: 0,
                details: '',
            });

            await fetchTransactions();

        } catch (error) {
            console.error('Error creating transaction:', error);
            showToast(
                error.response?.data?.message ||
                "Failed to create transaction",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="transactions-container">
            <div className="transactions-header">
                <h2>Transaction History</h2>
                <button
                    onClick={openModal}
                    className="add-button"
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Add Transaction"}
                </button>
            </div>

            <div className="transactions-table-container">
                <table className="transactions-table">
                    <thead>
                        <tr className="table-header">
                            <th>Amount</th>
                            <th>Details</th>
                            <th>Status</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 ? (
                            transactions.map(transaction => (
                                console.log(transaction),
                                <tr key={transaction._id} className="table-row">
                                    <td>${transaction.amount.toFixed(2)}</td>
                                    <td>{transaction.details}</td>
                                    <td className={`status-${transaction.status}`}>
                                        {transaction.status}
                                    </td>
                                    <td>{new Date(transaction.timestamp).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr className="table-row-empty">
                                <td colSpan="4">No transactions found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-container">
                        <h2>Add Transaction</h2>
                        <form onSubmit={handleSubmit} className="transaction-form">
                            <div className="form-group">
                                <label htmlFor="amount">Amount:</label>
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="details">Details:</label>
                                <input
                                    type="text"
                                    id="details"
                                    name="details"
                                    value={formData.details}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="cancel-button"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={loading}
                                >
                                    {loading ? "Adding..." : "Add Transaction"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionsPage;