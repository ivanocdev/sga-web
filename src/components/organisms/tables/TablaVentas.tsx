import { useMemo, useCallback, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { FiEdit2, FiTrash2, FiEye, FiFileText } from 'react-icons/fi'
import Swal from 'sweetalert2'
import styled from 'styled-components'
import { format } from 'date-fns'
import { MobileCard, MobileCardRow } from '@/components/atoms/MobileCard'
import { bp } from '@/styles/breakpoints'
import { useEliminarVenta } from '@/hooks/useVentas'
import { useVentasStore } from '@/store/ventasStore'
import { useAuth } from '@/context/AuthContext'
import { getUrlFactura } from '@/services/ventasService'
import type { Venta, EstadoVenta } from '@/types/ventas'

interface Props {
  data: Venta[]
  isLoading: boolean
  onEditar: (venta: Venta) => void
  busqueda: string
}

// abre la factura generando una URL firmada — el bucket es privado
function FacturaBtn({ path }: { path: string }) {
  const [cargando, setCargando] = useState(false)
  const { t } = useTranslation()

  async function abrir() {
    setCargando(true)
    try {
      const url = await getUrlFactura(path)
      window.open(url, '_blank')
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: t('errores.generico') })
    } finally {
      setCargando(false)
    }
  }

  return (
    <IconBtn onClick={abrir} disabled={cargando} title={t('ventas.ver_factura')}>
      <FiFileText />
    </IconBtn>
  )
}

export function TablaVentas({ data, isLoading, onEditar, busqueda }: Props) {
  const { t } = useTranslation()
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const { filtros, setFiltros } = useVentasStore()
  const { mutate: eliminar, isPending: eliminando } = useEliminarVenta()

  const esAdmin = usuario?.rol === 'admin'

  const handleEliminar = useCallback(
    (venta: Venta) => {
      Swal.fire({
        title: '¿Eliminar venta?',
        text: `Código: ${venta.codigo}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonText: t('common.cancelar'),
        confirmButtonText: t('common.eliminar'),
      }).then(res => {
        if (res.isConfirmed) eliminar(venta.id)
      })
    },
    [eliminar, t]
  )

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return '—'
    try {
      return format(new Date(fecha), 'dd/MM/yyyy')
    } catch {
      return fecha
    }
  }

  const columns = useMemo<ColumnDef<Venta>[]>(
    () => [
      { accessorKey: 'codigo', header: t('ventas.codigo'), size: 120 },
      {
        id: 'marca',
        header: t('ventas.marca'),
        accessorFn: row => row.marcas?.nombre ?? '—',
        size: 110,
      },
      {
        accessorKey: 'cantidad_productos',
        header: t('ventas.cantidad_productos'),
        size: 90,
        cell: ({ getValue }) => <span>{(getValue() as number | null) ?? '—'}</span>,
      },
      {
        accessorKey: 'cantidad_total',
        header: t('ventas.cantidad_total'),
        size: 80,
        cell: ({ getValue }) => <span>{(getValue() as number | null) ?? '—'}</span>,
      },
      {
        accessorKey: 'fecha',
        header: t('ventas.fecha'),
        size: 100,
        cell: ({ getValue }) => <span>{formatFecha(getValue() as string | null)}</span>,
      },
      {
        id: 'responsable',
        header: t('ventas.responsable'),
        size: 130,
        cell: ({ row }) => {
          if (row.original.estado === 'Devolucion') return <TextMuted>—</TextMuted>
          return (
            <span>{row.original.usuarios?.nombre ?? <TextMuted>{t('ventas.sin_asignar')}</TextMuted>}</span>
          )
        },
      },
      {
        id: 'factura',
        header: t('ventas.factura'),
        size: 70,
        cell: ({ row }) =>
          row.original.factura_url ? (
            <FacturaBtn path={row.original.factura_url} />
          ) : (
            <TextMuted>—</TextMuted>
          ),
      },
      {
        accessorKey: 'estado',
        header: t('ventas.estado'),
        size: 100,
        cell: ({ getValue }) => {
          const e = (getValue() as EstadoVenta) ?? 'Normal'
          return (
            <EstadoBadge $devolucion={e === 'Devolucion'}>
              {e === 'Devolucion' ? t('ventas.devolucion_label') : t('ventas.normal')}
            </EstadoBadge>
          )
        },
      },
      {
        id: 'acciones',
        header: '',
        size: esAdmin ? 100 : 50,
        cell: ({ row }) => {
          const v = row.original
          const esDevolucion = v.estado === 'Devolucion'
          return (
            <Acciones>
              <IconBtn
                onClick={() => navigate(`/ventas/${v.id}/productos`)}
                title={t('common.ver_detalle')}
              >
                <FiEye />
              </IconBtn>
              {esAdmin && !esDevolucion && (
                <>
                  <IconBtn onClick={() => onEditar(v)} title={t('common.editar')} disabled={eliminando}>
                    <FiEdit2 />
                  </IconBtn>
                  <IconBtn
                    $danger
                    onClick={() => handleEliminar(v)}
                    title={t('common.eliminar')}
                    disabled={eliminando}
                  >
                    <FiTrash2 />
                  </IconBtn>
                </>
              )}
            </Acciones>
          )
        },
      },
    ],
    [t, esAdmin, navigate, onEditar, handleEliminar, eliminando]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter: busqueda },
    onGlobalFilterChange: () => null,
    initialState: { pagination: { pageSize: 10 } },
  })

  if (isLoading) return <Estado>{t('common.cargando')}</Estado>

  return (
    <Wrapper>
      {/* filtro por estado */}
      <FiltroEstado>
        {(['', 'Normal', 'Devolucion'] as const).map(e => (
          <PillBtn
            key={e}
            $activo={filtros.estado === e}
            onClick={() => setFiltros({ estado: e })}
          >
            {e === '' ? t('ventas.todos_estados') : e === 'Normal' ? t('ventas.normal') : t('ventas.devolucion_label')}
          </PillBtn>
        ))}
      </FiltroEstado>

      {!data.length ? (
        <Estado>{t('ventas.sin_ventas')}</Estado>
      ) : (
        <>
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
              const v = row.original
              const esDevolucion = v.estado === 'Devolucion'
              return (
                <MobileCard key={v.id} onClick={() => navigate(`/ventas/${v.id}/productos`)}>
                  <CardHeader>
                    <div>
                      <span className="codigo">{v.codigo}</span>
                      <span className="marca">{v.marcas?.nombre ?? '—'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <EstadoBadge $devolucion={esDevolucion}>
                        {esDevolucion ? t('ventas.devolucion_label') : t('ventas.normal')}
                      </EstadoBadge>
                      {esAdmin && !esDevolucion && (
                        <CardActions onClick={e => e.stopPropagation()}>
                          <IconBtn onClick={() => onEditar(v)} disabled={eliminando}>
                            <FiEdit2 />
                          </IconBtn>
                          <IconBtn $danger onClick={() => handleEliminar(v)} disabled={eliminando}>
                            <FiTrash2 />
                          </IconBtn>
                        </CardActions>
                      )}
                    </div>
                  </CardHeader>
                  <MobileCardRow label={t('ventas.fecha')} value={formatFecha(v.fecha)} />
                  <MobileCardRow
                    label={t('ventas.responsable')}
                    value={
                      esDevolucion
                        ? '—'
                        : (v.usuarios?.nombre ?? t('ventas.sin_asignar'))
                    }
                  />
                  <MobileCardRow label={t('ventas.cantidad_productos')} value={v.cantidad_productos ?? '—'} />
                  <MobileCardRow label={t('ventas.cantidad_total')} value={v.cantidad_total ?? '—'} />
                  {v.factura_url && (
                    <MobileCardRow
                      label={t('ventas.factura')}
                      value={<FacturaBtn path={v.factura_url} />}
                    />
                  )}
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
        </>
      )}
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

const FiltroEstado = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface};
  flex-wrap: wrap;
`

const PillBtn = styled.button<{ $activo: boolean }>`
  padding: 0.3rem 0.875rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid ${({ $activo, theme }) => ($activo ? theme.primary : theme.border)};
  background: ${({ $activo, theme }) => ($activo ? theme.primary : 'transparent')};
  color: ${({ $activo, theme }) => ($activo ? '#fff' : theme.text)};
  transition: all 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
    color: ${({ $activo, theme }) => ($activo ? '#fff' : theme.primary)};
  }
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

const EstadoBadge = styled.span<{ $devolucion: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  background: ${({ $devolucion, theme }) =>
    $devolucion ? `${theme.danger}20` : `${theme.success}20`};
  color: ${({ $devolucion, theme }) => ($devolucion ? theme.danger : theme.success)};
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

  .codigo {
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
