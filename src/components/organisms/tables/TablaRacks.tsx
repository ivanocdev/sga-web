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
import { useEliminarRack } from '@/hooks/useRacks'
import { useAuth } from '@/context/AuthContext'
import type { Rack } from '@/types/racks'

interface Props {
  data: Rack[]
  isLoading: boolean
  onEditar: (rack: Rack) => void
}

export function TablaRacks({ data, isLoading, onEditar }: Props) {
  const { t } = useTranslation()
  const { usuario } = useAuth()
  const { mutate: eliminar, isPending: eliminando } = useEliminarRack()

  const esAdmin = usuario?.rol === 'admin'

  const handleEliminar = useCallback(
    (rack: Rack) => {
      Swal.fire({
        title: '¿Eliminar rack?',
        text: rack.codigo_rack,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonText: t('common.cancelar'),
        confirmButtonText: t('common.eliminar'),
      }).then(res => {
        if (res.isConfirmed) eliminar(rack.id)
      })
    },
    [eliminar, t]
  )

  const columns = useMemo<ColumnDef<Rack>[]>(
    () => [
      { accessorKey: 'codigo_rack', header: t('racks.codigo'), size: 110 },
      { accessorKey: 'nivel', header: t('racks.nivel'), size: 80 },
      { accessorKey: 'lado', header: t('racks.lado'), size: 80 },
      { accessorKey: 'posicion', header: t('racks.posicion'), size: 90 },
      {
        id: 'estado',
        header: t('racks.estado'),
        size: 100,
        cell: ({ row }) => (
          <EstadoBadge $ocupado={row.original.ocupado}>
            {row.original.ocupado ? t('racks.ocupado') : t('racks.libre')}
          </EstadoBadge>
        ),
      },
      {
        id: 'marca',
        header: t('racks.marca'),
        accessorFn: row => row.marcas?.nombre ?? '—',
        size: 120,
      },
      {
        id: 'productos',
        header: t('racks.productos_en_rack'),
        size: 200,
        cell: ({ row }) => {
          const productos = row.original.productos_info
          if (!productos.length) {
            return <TextMuted>{t('racks.sin_producto')}</TextMuted>
          }
          const [primero, ...resto] = productos
          return (
            <div>
              <span>{primero.nombre}</span>
              {resto.length > 0 && (
                <TextMuted> +{resto.length}</TextMuted>
              )}
            </div>
          )
        },
      },
      ...(esAdmin
        ? [
            {
              id: 'acciones',
              header: t('common.acciones'),
              size: 90,
              cell: ({ row }: { row: { original: Rack } }) => (
                <Acciones>
                  <IconBtn
                    onClick={() => onEditar(row.original)}
                    title={t('common.editar')}
                    disabled={eliminando}
                  >
                    <FiEdit2 />
                  </IconBtn>
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
            } satisfies ColumnDef<Rack>,
          ]
        : []),
    ],
    [t, esAdmin, onEditar, handleEliminar, eliminando]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  if (isLoading) return <Estado>{t('common.cargando')}</Estado>
  if (!data.length) return <Estado>{t('racks.sin_racks')}</Estado>

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
          const r = row.original
          return (
            <MobileCard key={r.id}>
              <CardHeader>
                <div>
                  <span className="code">{r.codigo_rack}</span>
                  <span className="marca">{r.marcas?.nombre ?? '—'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <EstadoBadge $ocupado={r.ocupado}>
                    {r.ocupado ? t('racks.ocupado') : t('racks.libre')}
                  </EstadoBadge>
                  {esAdmin && (
                    <CardActions>
                      <IconBtn onClick={() => onEditar(r)} disabled={eliminando}>
                        <FiEdit2 />
                      </IconBtn>
                      <IconBtn $danger onClick={() => handleEliminar(r)} disabled={eliminando}>
                        <FiTrash2 />
                      </IconBtn>
                    </CardActions>
                  )}
                </div>
              </CardHeader>
              <MobileCardRow label={t('racks.nivel')} value={r.nivel} />
              <MobileCardRow label={t('racks.lado')} value={r.lado} />
              <MobileCardRow label={t('racks.posicion')} value={r.posicion} />
              <MobileCardRow
                label={t('racks.productos_en_rack')}
                value={
                  r.productos_info.length
                    ? r.productos_info.map(p => p.nombre).join(', ')
                    : t('racks.sin_producto')
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

const EstadoBadge = styled.span<{ $ocupado: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  background: ${({ $ocupado, theme }) =>
    $ocupado ? `${theme.danger}20` : `${theme.success}20`};
  color: ${({ $ocupado, theme }) => ($ocupado ? theme.danger : theme.success)};
`

const TextMuted = styled.span`
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.85rem;
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

  .code {
    font-weight: 600;
    color: ${({ theme }) => theme.text};
    font-size: 0.95rem;
    display: block;
  }

  .marca {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.textMuted};
  }
`

const CardActions = styled.div`
  display: flex;
  gap: 0.25rem;
`

const Acciones = styled.div`
  display: flex;
  gap: 0.375rem;
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
