import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wallet,
  Plus,
  DollarSign,
  TrendingDown,
  PieChart,
  Calendar,
  CreditCard,
  Trash2,
  Edit3,
  Search,
  X
} from 'lucide-react';

export default function ExpensesScreen() {
  const { expenses, addExpense, updateExpense, deleteExpense, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingExp, setEditingExp] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Tech & Software',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Credit Card',
    notes: ''
  });

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      amount: '',
      category: 'Tech & Software',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Credit Card',
      notes: ''
    });
    setIsCreateOpen(true);
  };

  const handleSaveCreate = (e) => {
    e.preventDefault();
    addExpense(formData);
    setIsCreateOpen(false);
  };

  const handleOpenEdit = (exp) => {
    setEditingExp(exp);
    setFormData({
      title: exp.title,
      amount: exp.amount,
      category: exp.category,
      date: exp.date,
      paymentMethod: exp.paymentMethod || 'Credit Card',
      notes: exp.notes || ''
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editingExp) {
      updateExpense(editingExp.expenseId, formData);
      setEditingExp(null);
    }
  };

  const totalAmount = expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  // Group by category
  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + (parseFloat(curr.amount) || 0);
    return acc;
  }, {});

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#FCF9F3] to-[#F5EFEB] p-6 rounded-3xl border border-[#DFCA95]/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-5 h-5 text-[#9E7D3B]" />
            <h2 className="font-serif font-bold text-2xl text-stone-900">Expense Tracking</h2>
          </div>
          <p className="text-xs text-stone-500">
            Section 10: Record personal expenses, track budget categories & view real-time expenditure metrics.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DFCA95] via-[#C5A059] to-[#9E7D3B] text-white text-xs font-semibold shadow-md hover:brightness-105 transition flex items-center gap-1.5 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* KPI Cards & Category Visual Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Total Spending */}
        <div className="p-5 rounded-3xl bg-white border border-[#DFCA95]/60 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Recorded Expenses</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-serif font-black text-stone-900">${totalAmount.toFixed(2)}</span>
              <span className="text-xs text-stone-400">USD</span>
            </div>
            <p className="text-xs text-stone-500 mt-2">
              Monthly budget cap: <strong className="text-stone-700">$500.00</strong>
            </p>
          </div>

          <div className="mt-4">
            <div className="w-full bg-[#EFE7DD] h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#DFCA95] to-[#C5A059] h-full rounded-full"
                style={{ width: `${Math.min(100, Math.round((totalAmount / 500) * 100))}%` }}
              />
            </div>
            <p className="text-[10px] text-stone-500 mt-1 text-right">
              {Math.round((totalAmount / 500) * 100)}% of monthly budget utilized
            </p>
          </div>
        </div>

        {/* Category Breakdown (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white border border-[#DFCA95]/60 shadow-xs">
          <h3 className="font-serif font-bold text-sm text-stone-900 mb-3 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-[#9E7D3B]" />
            <span>Category Spending Breakdown</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(categoryTotals).map(([cat, amt]) => {
              const pct = totalAmount > 0 ? Math.round((amt / totalAmount) * 100) : 0;
              return (
                <div key={cat} className="p-3 rounded-2xl bg-[#FCF9F3] border border-[#DFCA95]/40">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-stone-800">{cat}</span>
                    <span className="font-bold text-[#9E7D3B]">${amt.toFixed(2)} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#EFE7DD] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#C5A059] h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#DFCA95]/50 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Search expenses by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-stone-50/50"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white text-stone-700 font-medium"
        >
          <option value="all">All Categories</option>
          <option value="Tech & Software">Tech & Software</option>
          <option value="Wellness & Food">Wellness & Food</option>
          <option value="Education">Education</option>
          <option value="Workspace">Workspace</option>
          <option value="General">General</option>
        </select>
      </div>

      {/* Expense Records List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredExpenses.map(exp => (
          <div
            key={exp.expenseId}
            className="p-4 rounded-2xl bg-white border border-[#DFCA95]/60 hover:border-[#DFCA95] shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className="p-3 rounded-xl bg-[#FCF9F3] text-[#9E7D3B] border border-[#DFCA95]/40 shrink-0">
                <DollarSign className="w-5 h-5 text-[#C5A059]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-semibold text-[#9E7D3B] bg-[#F5EFEB] px-1.5 py-0.5 rounded">
                    {exp.expenseId}
                  </span>
                  <h4 className="font-serif font-bold text-sm text-stone-900 truncate">{exp.title}</h4>
                  <span className="text-[10px] font-semibold bg-[#F3E8CB] text-[#7A5C24] px-2 py-0.5 rounded-full border border-[#DFCA95]/40">
                    {exp.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#9E7D3B]" />
                    {exp.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-[#9E7D3B]" />
                    {exp.paymentMethod}
                  </span>
                  {exp.notes && (
                    <>
                      <span>•</span>
                      <span className="text-stone-600 italic truncate max-w-xs">{exp.notes}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#F5EFEB]">
              <span className="text-base font-serif font-bold text-stone-900">
                ${parseFloat(exp.amount).toFixed(2)}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(exp)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-[#F5EFEB] transition"
                  title="Edit Expense"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteExpense(exp.expenseId)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="Delete Expense"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredExpenses.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#DFCA95]/50">
            <Wallet className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-700">No expenses found</p>
            <p className="text-xs text-stone-400 mt-1">Click "Add Expense" to track your personal spending</p>
          </div>
        )}
      </div>

      {/* Modal: Create Expense */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white border border-[#DFCA95] rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB] mb-4">
              <h3 className="font-serif font-bold text-lg text-stone-900">Record New Expense</h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 rounded-full text-stone-400 hover:bg-[#F5EFEB]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Expense Title / Item</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Cloud compute credits"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 45.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white"
                  >
                    <option value="Tech & Software">Tech & Software</option>
                    <option value="Wellness & Food">Wellness & Food</option>
                    <option value="Education">Education</option>
                    <option value="Workspace">Workspace</option>
                    <option value="Travel">Travel</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Apple Pay">Apple Pay</option>
                    <option value="Corporate Card">Corporate Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Notes / Rationale</label>
                <textarea
                  rows="2"
                  placeholder="Optional context..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-[#F5EFEB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#9E7D3B] text-white text-xs font-semibold shadow-xs"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Expense */}
      {editingExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white border border-[#DFCA95] rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB] mb-4">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Edit Expense: {editingExp.expenseId}
              </h3>
              <button onClick={() => setEditingExp(null)} className="p-1 rounded-full text-stone-400 hover:bg-[#F5EFEB]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden bg-white"
                  >
                    <option value="Tech & Software">Tech & Software</option>
                    <option value="Wellness & Food">Wellness & Food</option>
                    <option value="Education">Education</option>
                    <option value="Workspace">Workspace</option>
                    <option value="Travel">Travel</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Notes</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-[#C5A059] focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingExp(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-[#F5EFEB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#9E7D3B] text-white text-xs font-semibold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
