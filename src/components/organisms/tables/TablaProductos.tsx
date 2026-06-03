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
import { useEliminarProducto } from '@/hooks/useProductos'
import type { Producto } from '@/types/productos'

interface Props {
  data: Producto[]
  isLoading: boolean
  onEditar: (producto: Producto) => void
}

export function TablaProductos({ data, isLoading, onEditar }: Props) {
  const { t } = useTranslation()
  const { mutate: eliminar, isPending: eliminando } = useEliminarProducto()

  const handleEliminar = useCallback(
    (producto: Producto) => {
      Swal.fire({
        title: '¿Eliminar producto?',
        text: producto.nombre,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonText: t('common.cancelar'),
        confirmButtonText: t('common.eliminar'),
      }).then(res => {
        if (res.isConfirmed) eliminar(producto.id)
      })
    },
    [eliminar, t]
  )

  const columns = useMemo<ColumnDef<Producto>[]>(
    () => [
      { accessorKey: 'codigo', header: 'Código', size: 90 },
      { accessorKey: 'nombre', header: t('productos.nombre'), size: 220 },
      {
        id: 'marca',
        header: t('productos.marca'),
        accessorFn: row => row.marcas?.nombre ?? '—',
        size: 130,
      },
      { accessorKey: 'tarimas', header: 'Tarimas', size: 80 },
      { accessorKey: 'cantidad_piso', header: t('productos.piso'), size: 80 },
      { accessorKey: 'cantidad_suelto', header: t('productos.suelto'), size: 80 },
      { accessorKey: 'total', header: 'Total', size: 80 },
      {
        id: 'acciones',
        header: t('common.acciones'),
        size: 90,
        cell: ({ row }) => (
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
      },
    ],
    [t, onEditar, handleEliminar, eliminando]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  if (isLoading) return <Estado>{t('common.cargando')}</Estado>
  if (!data.length) return <Estado>{t('productos.sin_productos')}</Estado>

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
          const p = row.original
          return (
            <MobileCard key={p.id}>
              <CardHeader>
                <div>
                  <span className="code">{p.codigo}</span>
                  <span className="name">{p.nombre}</span>
                </div>
                <CardActions>
                  <IconBtn onClick={() => onEditar(p)} disabled={eliminando}>
                    <FiEdit2 />
                  </IconBtn>
                  <IconBtn $danger onClick={() => handleEliminar(p)} disabled={eliminando}>
                    <FiTrash2 />
                  </IconBtn>
                </CardActions>
              </CardHeader>
              <MobileCardRow label={t('productos.marca')} value={p.marcas?.nombre ?? '—'} />
              <MobileCardRow label="Tarimas" value={p.tarimas} />
              <MobileCardRow label={t('productos.piso')} value={p.cantidad_piso} />
              <MobileCardRow label={t('productos.suelto')} value={p.cantidad_suelto} />
              <MobileCardRow label="Total" value={<strong>{p.total}</strong>} />
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

  .code {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.textMuted};
    display: block;
  }

  .name {
    font-weight: 600;
    color: ${({ theme }) => theme.text};
    font-size: 0.95rem;
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
