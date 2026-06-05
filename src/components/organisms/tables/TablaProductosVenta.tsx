import { useMemo, useCallback } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { FiTrash2 } from 'react-icons/fi'
import { format } from 'date-fns'
import Swal from 'sweetalert2'
import styled from 'styled-components'
import { MobileCard, MobileCardRow } from '@/components/atoms/MobileCard'
import { bp } from '@/styles/breakpoints'
import { useDetalleVenta, useEliminarDetalleVenta } from '@/hooks/useVentas'
import { useAuth } from '@/context/AuthContext'
import type { DetalleVenta } from '@/types/ventas'

interface Props {
  ventaId: number
  isDevolucion: boolean
}

export function TablaProductosVenta({ ventaId, isDevolucion }: Props) {
  const { t } = useTranslation()
  const { usuario } = useAuth()
  const { data = [], isLoading } = useDetalleVenta(ventaId)
  const { mutate: eliminar, isPending: eliminando } = useEliminarDetalleVenta(ventaId)

  const esAdmin = usuario?.rol === 'admin'
  // en devoluciones no se pueden eliminar productos
  const puedeEliminar = esAdmin && !isDevolucion

  const formatFecha = (f: string | null) => {
    if (!f) return '—'
    try { return format(new Date(f), 'dd/MM/yyyy') } catch { return f }
  }

  const handleEliminar = useCallback(
    (detalle: DetalleVenta) => {
      Swal.fire({
        title: '¿Eliminar producto del pedido?',
        text: detalle.productos?.nombre ?? '',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonText: t('common.cancelar'),
        confirmButtonText: t('common.eliminar'),
      }).then(res => {
        if (res.isConfirmed) eliminar(detalle.id)
      })
    },
    [eliminar, t]
  )

  const columns = useMemo<ColumnDef<DetalleVenta>[]>(
    () => [
      {
        id: 'codigo',
        header: t('ventas.codigo'),
        size: 90,
        accessorFn: row => row.productos?.codigo ?? '—',
      },
      {
        id: 'nombre',
        header: t('productos.nombre'),
        size: 200,
        accessorFn: row => row.productos?.nombre ?? '—',
      },
      {
        accessorKey: 'cantidad',
        header: t('cajas.cantidad'),
        size: 80,
      },
      {
        accessorKey: 'fecha_caducidad',
        header: t('cajas.fecha_caducidad'),
        size: 120,
        cell: ({ getValue }) => <span>{formatFecha(getValue() as string | null)}</span>,
      },
      {
        accessorKey: 'ubicacion',
        header: t('productos.ubicacion'),
        size: 100,
        cell: ({ getValue }) => <span>{(getValue() as string | null) ?? '—'}</span>,
      },
      ...(puedeEliminar
        ? [
            {
              id: 'acciones',
              header: '',
              size: 50,
              cell: ({ row }: { row: { original: DetalleVenta } }) => (
                <IconBtn
                  $danger
                  onClick={() => handleEliminar(row.original)}
                  disabled={eliminando}
                  title={t('common.eliminar')}
                >
                  <FiTrash2 />
                </IconBtn>
              ),
            } satisfies ColumnDef<DetalleVenta>,
          ]
        : []),
    ],
    [t, puedeEliminar, handleEliminar, eliminando]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  })

  if (isLoading) return <Estado>{t('common.cargando')}</Estado>
  if (!data.length) return <Estado>{t('ventas.sin_ventas')}</Estado>

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
          const d = row.original
          return (
            <MobileCard key={d.id}>
              <CardHeader>
                <div>
                  <span className="codigo">{d.productos?.codigo ?? '—'}</span>
                  <span className="nombre">{d.productos?.nombre ?? '—'}</span>
                </div>
                {puedeEliminar && (
                  <IconBtn
                    $danger
                    onClick={() => handleEliminar(d)}
                    disabled={eliminando}
                  >
                    <FiTrash2 />
                  </IconBtn>
                )}
              </CardHeader>
              <MobileCardRow label={t('cajas.cantidad')} value={d.cantidad} />
              <MobileCardRow label={t('cajas.fecha_caducidad')} value={formatFecha(d.fecha_caducidad)} />
              <MobileCardRow label={t('productos.ubicacion')} value={d.ubicacion ?? '—'} />
            </MobileCard>
          )
        })}
      </CardList>

      {table.getPageCount() > 1 && (
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
      )}
    </Wrapper>
  )
}

// --- estilos ---

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
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
  &:hover { background: ${({ theme }) => theme.surfaceHover}; }
  &:last-child { border-bottom: none; }
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

  @media ${bp.md} { display: none; }
`

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.25rem;

  .codigo {
    font-weight: 600;
    color: ${({ theme }) => theme.text};
    font-size: 0.95rem;
    display: block;
  }

  .nombre {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.textMuted};
  }
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
    background: ${({ $danger, theme }) => ($danger ? `${theme.danger}18` : theme.primaryLight)};
    color: ${({ $danger, theme }) => ($danger ? theme.danger : theme.primary)};
  }

  &:disabled { opacity: 0.4; cursor: not-allowed; }
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

  &:hover:not(:disabled) { background: ${({ theme }) => theme.surfaceHover}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`

const PagInfo = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textMuted};
`
