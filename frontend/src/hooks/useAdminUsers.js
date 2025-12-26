import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userService from '../services/userService';
import adminService from '../services/adminService';

export default function useAdminUsers({ initialPage = 1, initialPageSize = 10 } = {}) {
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const { data: resp = null, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['adminUsers', page, pageSize, searchQuery],
    queryFn: () => userService.getAllUsers({ page, limit: pageSize, q: searchQuery }),
    staleTime: 1000 * 60, // 1 minute
    keepPreviousData: true,
  });

  // Support both response shapes: array (legacy) or { data, total }
  const usersArray = useMemo(() => {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;
    if (resp.data && Array.isArray(resp.data)) return resp.data;
    return [];
  }, [resp]);

  const total = useMemo(() => {
    if (!resp) return 0;
    if (Array.isArray(resp)) return resp.length;
    if (typeof resp.total === 'number') return resp.total;
    if (Array.isArray(resp.data)) return resp.data.length;
    return 0;
  }, [resp]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // ensure page is within bounds
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const normalized = useMemo(() => {
    return usersArray.map(u => ({
      id: u.id,
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
      email: u.email,
      role: u.role,
      status: u.status,
      image: u.image_url || null,
      raw: u,
    }));
  }, [usersArray]);

  const approveMutation = useMutation({
    mutationFn: (id) => adminService.approveUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminUsers'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => adminService.rejectUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminUsers'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => userService.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminUsers'] }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => userService.updateUserRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminUsers'] }),
  });

  return {
    users: normalized,
    rawUsers: usersArray,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    searchQuery,
    setSearchQuery,
    isLoading,
    isFetching,
    refetch,
    approve: (id) => approveMutation.mutateAsync(id),
    reject: (id) => rejectMutation.mutateAsync(id),
    remove: (id) => deleteMutation.mutateAsync(id),
    updateRole: ({ id, role }) => updateRoleMutation.mutateAsync({ id, role }),
  };
}
