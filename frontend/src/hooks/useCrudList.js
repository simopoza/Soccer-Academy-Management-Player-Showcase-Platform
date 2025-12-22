import { useState } from 'react';

// Lightweight reusable CRUD list hook for admin pages
export default function useCrudList({ initialData = [], idField = 'id', initialForm = {} } = {}) {
  const [items, setItems] = useState(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  // modal controls (pages can use these directly)
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const onAddOpen = () => setIsAddOpen(true);
  const onAddClose = () => setIsAddOpen(false);
  const onEditOpen = () => setIsEditOpen(true);
  const onEditClose = () => setIsEditOpen(false);
  const onDeleteOpen = () => setIsDeleteOpen(true);
  const onDeleteClose = () => setIsDeleteOpen(false);

  const _nextId = () => {
    if (!items || items.length === 0) return 1;
    const max = items.reduce((m, it) => (Number(it[idField]) > m ? Number(it[idField]) : m), 0);
    return max + 1;
  };

  const handleAdd = (extra = {}) => {
    const nextId = _nextId();
    const newItem = { [idField]: nextId, ...formData, ...extra };
    setItems(prev => [...prev, newItem]);
    return newItem;
  };

  const handleEdit = (overrides = {}) => {
    if (!selectedItem) return null;
    const updated = { ...selectedItem, ...formData, ...overrides };
    setItems(prev => prev.map(i => (i[idField] === selectedItem[idField] ? updated : i)));
    return updated;
  };

  const handleDelete = () => {
    if (!selectedItem) return null;
    setItems(prev => prev.filter(i => i[idField] !== selectedItem[idField]));
    return selectedItem;
  };

  const openEditDialog = (item) => {
    setSelectedItem(item);
    setFormData(item || initialForm);
    onEditOpen();
  };

  const openDeleteDialog = (item) => {
    setSelectedItem(item);
    onDeleteOpen();
  };

  return {
    items,
    setItems,
    searchQuery,
    setSearchQuery,
    selectedItem,
    setSelectedItem,
    formData,
    setFormData,

    isAddOpen,
    onAddOpen,
    onAddClose,
    isEditOpen,
    onEditOpen,
    onEditClose,
    isDeleteOpen,
    onDeleteOpen,
    onDeleteClose,

    handleAdd,
    handleEdit,
    handleDelete,
    openEditDialog,
    openDeleteDialog,
  };
}
