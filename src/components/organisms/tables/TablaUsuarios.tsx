import { useMemo, useCallback } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import Swal from 'sweetalert2'
import styled from 'styled-components'
import { MobileCard, MobileCardRow } from '@/components/atoms/MobileCard'
import { bp } from '@/styles/breakpoints'
import { useEliminarUsuario } from '@/hooks/useUsuarios'
import { useAuth } from '@/context/AuthContext'
import type { Usuario } from '@/types/auth'

interface Props {
  data: Usuario[]
  isLoading: boolean
  onEditar?: (usuario: Usuario) => void
}

export function TablaUsuarios({ data, isLoading, onEditar }: Props) {
  const { t } = useTranslation()
  const { usuario: yo } = useAuth()
  const { mutate: eliminar, isPending: eliminando } = useEliminarUsuario()

  const handleEliminar = useCallback(
    (usuario: Usuario) => {
      // no permitir autoeliminación
      if (usuario.id === yo?.id) {
        void Swal.fire({ icon: 'warning', title: 'Acción no permitida', text: 'No puedes eliminar tu propia cuenta.' })
        return
      }
      void Swal.fire({
        title: '¿Eliminar usuario?',
        text: usuario.nombre,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonText: t('common.cancelar'),
        confirmButtonText: t('common.eliminar'),
      }).then(res => {
        if (res.isConfirmed) eliminar(usuario.id)
      })
    },
    [eliminar, t, yo]
  )

  const columns = useMemo<ColumnDef<Usuario>[]>(
    () => [
      { accessorKey: 'nombre', header: t('usuarios.nombre'), size: 200 },
      { accessorKey: 'correo', header: t('usuarios.correo'), size: 240 },
      {
        id: 'rol',
        header: t('usuarios.rol'),
        size: 110,
        cell: ({ row }) => (
          <RolBadge $admin={row.original.rol === 'admin'}>{row.original.rol}</RolBadge>
        ),
      },
      {
        id: 'estado',
        header: 'Estado',
        size: 100,
        cell: ({ row }) => (
          <EstadoBadge $activo={row.original.activo}>
            {row.original.activo ? t('common.activo') : t('common.inactivo')}
          </EstadoBadge>
        ),
      },
      {
        id: 'acciones',
        header: t('common.acciones'),
        size: 90,
        cell: ({ row }) => (
          <Acciones>
            {onEditar && (
              <IconBtn
                onClick={() => onEditar(row.original)}
                title={t('common.editar')}
                disabled={eliminando}
              >
                <FiEdit2 />
              </IconBtn>
            )}
            <IconBtn
              $danger
              onClick={() => handleEliminar(row.original)}
              title={t('common.eliminar')}
              disabled={eliminando}
            >
              <FiTrash2 />
            </IconBtn>
          </Acciones>
        ),
      },
    ],
    [t, onEditar, handleEliminar, eliminando]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  })

  if (isLoading) return <Estado>{t('common.cargando')}</Estado>
  if (!data.length) return <Estado>{t('usuarios.sin_usuarios')}</Estado>

  return (
    <Wrapper>
      {/* desktop */}
      <TableScroll>
        <Table>
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <Th key={h.id} style={{ width: h.getSize() }}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </Th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <Tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                ))}
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableScroll>

      {/* mobile — cards */}
      <CardList>
        {table.getRowModel().rows.map(row => {
          const u = row.original
          return (
            <MobileCard key={u.id}>
              <CardHeader>
                <div>
                  <span className="name">{u.nombre}</span>
                  <span className="email">{u.correo}</span>
                </div>
                <CardActions>
                  {onEditar && (
                    <IconBtn onClick={() => onEditar(u)} disabled={eliminando}>
                      <FiEdit2 />
                    </IconBtn>
                  )}
                  <IconBtn $danger onClick={() => handleEliminar(u)} disabled={eliminando}>
                    <FiTrash2 />
                  </IconBtn>
                </CardActions>
              </CardHeader>
              <MobileCardRow
                label={t('usuarios.rol')}
                value={<RolBadge $admin={u.rol === 'admin'}>{u.rol}</RolBadge>}
              />
              <MobileCardRow
                label="Estado"
                value={
                  <EstadoBadge $activo={u.activo}>
                    {u.activo ? t('common.activo') : t('common.inactivo')}
                  </EstadoBadge>
                }
              />
            </MobileCard>
          )
        })}
      </CardList>

      <Paginacion>
        <PagBtn onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          {t('common.anterior')}
        </PagBtn>
        <PagInfo>
          {t('common.pagina')} {table.getState().pagination.pageIndex + 1} {t('common.de')}{' '}
          {table.getPageCount()}
        </PagInfo>
        <PagBtn onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          {t('common.siguiente')}
        </PagBtn>
      </Paginacion>
    </Wrapper>
  )
}

// --- estilos ---

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
  overflow: hidden;
`

const TableScroll = styled.div`
  display: none;
  overflow-x: auto;
  flex: 1;

  @media ${bp.md} {
    display: block;
  }
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`

const Th = styled.th`
  text-align: left;
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.textMuted};
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  white-space: nowrap;
`

const Tr = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.border};
  transition: background 0.1s;

  &:hover {
    background: ${({ theme }) => theme.surfaceHover};
  }

  &:last-child {
    border-bottom: none;
  }
`

const Td = styled.td`
  padding: 0.75rem 1rem;
  color: ${({ theme }) => theme.text};
  white-space: nowrap;
`

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  overflow-y: auto;
  flex: 1;

  @media ${bp.md} {
    display: none;
  }
`

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.25rem;

  .name {
    font-weight: 600;
    color: ${({ theme }) => theme.text};
    font-size: 0.95rem;
    display: block;
  }

  .email {
    font-size: 0.78rem;
    color: ${({ theme }) => theme.textMuted};
    display: block;
  }
`

const CardActions = styled.div`
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
`

const Acciones = styled.div`
  display: flex;
  gap: 0.375rem;
`

const RolBadge = styled.span<{ $admin: boolean }>`
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: capitalize;
  background: ${({ $admin, theme }) => ($admin ? `${theme.primary}22` : `${theme.success}22`)};
  color: ${({ $admin, theme }) => ($admin ? theme.primary : theme.success)};
`

const EstadoBadge = styled.span<{ $activo: boolean }>`
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 600;
  background: ${({ $activo, theme }) => ($activo ? `${theme.success}22` : `${theme.danger}18`)};
  color: ${({ $activo, theme }) => ($activo ? theme.success : theme.danger)};
`

const IconBtn = styled.button<{ $danger?: boolean }>`
  background: transparent;
  border: none;
  padding: 0.375rem;
  border-radius: 6px;
  cursor: pointer;
  color: ${({ $danger, theme }) => ($danger ? theme.danger : theme.textMuted)};
  display: flex;
  align-items: center;
  transition: background 0.15s, color 0.15s;

  &:hover:not(:disabled) {
    background: ${({ $danger, theme }) =>
      $danger ? `${theme.danger}18` : theme.primaryLight};
    color: ${({ $danger, theme }) => ($danger ? theme.danger : theme.primary)};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const Estado = styled.div`
  padding: 3rem;
  text-align: center;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.9rem;
`

const Paginacion = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface};
`

const PagBtn = styled.button`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  padding: 0.375rem 0.875rem;
  font-size: 0.8rem;
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.surfaceHover};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const PagInfo = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textMuted};
`
