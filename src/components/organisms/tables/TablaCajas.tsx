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
import { format, parseISO, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import Swal from 'sweetalert2'
import styled from 'styled-components'
import { MobileCard, MobileCardRow } from '@/components/atoms/MobileCard'
import { bp } from '@/styles/breakpoints'
import { useEliminarRegistroCaja } from '@/hooks/useCajas'
import { useAuth } from '@/context/AuthContext'
import type { RegistroCaja, TipoRegistro } from '@/types/cajas'

interface Props {
  productoId: number
  data: RegistroCaja[]
  isLoading: boolean
  onEditar: (registro: RegistroCaja) => void
}

function formatFecha(iso: string | null): string {
  if (!iso) return '—'
  try {
    return format(parseISO(iso), 'dd/MM/yyyy', { locale: es })
  } catch {
    return iso
  }
}

// resalta caducidad próxima para facilitar el despacho FIFO
function CaducidadCell({ fecha }: { fecha: string | null }) {
  if (!fecha) return <span>—</span>

  const dias = differenceInDays(parseISO(fecha), new Date())
  const texto = formatFecha(fecha)

  if (dias < 0) return <CaducidadText $nivel="expirado">{texto}</CaducidadText>
  if (dias <= 15) return <CaducidadText $nivel="urgente">{texto}</CaducidadText>
  if (dias <= 30) return <CaducidadText $nivel="proximo">{texto}</CaducidadText>
  return <span>{texto}</span>
}

export function TablaCajas({ productoId, data, isLoading, onEditar }: Props) {
  const { t } = useTranslation()
  const { usuario } = useAuth()
  const { mutate: eliminar, isPending: eliminando } = useEliminarRegistroCaja(productoId)

  const esAdmin = usuario?.rol === 'admin'

  const labelTipo = (tipo: TipoRegistro) => {
    if (tipo === 'caja') return t('cajas.tipo_caja')
    if (tipo === 'suelto') return t('cajas.tipo_suelto')
    return t('cajas.tipo_piso')
  }

  const handleEliminar = useCallback(
    (registro: RegistroCaja) => {
      Swal.fire({
        title: '¿Eliminar registro?',
        text: `${labelTipo(registro.tipo)} — ${registro.cantidad} unidades`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonText: t('common.cancelar'),
        confirmButtonText: t('common.eliminar'),
      }).then(res => {
        if (res.isConfirmed) eliminar(registro)
      })
    },
    [eliminar, t]
  )

  const columns = useMemo<ColumnDef<RegistroCaja>[]>(
    () => [
      {
        id: 'tipo',
        header: t('cajas.tipo'),
        size: 90,
        cell: ({ row }) => (
          <TipoBadge $tipo={row.original.tipo}>{labelTipo(row.original.tipo)}</TipoBadge>
        ),
      },
      {
        accessorKey: 'codigo_barras',
        header: t('cajas.codigo_barras'),
        size: 160,
        cell: ({ getValue }) => <span>{(getValue() as string | null) ?? '—'}</span>,
      },
      { accessorKey: 'cantidad', header: t('cajas.cantidad'), size: 90 },
      {
        id: 'caducidad',
        header: t('cajas.fecha_caducidad'),
        size: 130,
        cell: ({ row }) => <CaducidadCell fecha={row.original.fecha_caducidad} />,
      },
      {
        accessorKey: 'ubicacion',
        header: t('cajas.ubicacion'),
        size: 120,
      },
      {
        id: 'entrada',
        header: t('cajas.fecha_entrada'),
        size: 120,
        cell: ({ row }) => <span>{formatFecha(row.original.fecha_entrada)}</span>,
      },
      ...(esAdmin
        ? [
            {
              id: 'acciones',
              header: t('common.acciones'),
              size: 90,
              cell: ({ row }: { row: { original: RegistroCaja } }) => (
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
            } satisfies ColumnDef<RegistroCaja>,
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
    initialState: { pagination: { pageSize: 15 } },
  })

  if (isLoading) return <Estado>{t('common.cargando')}</Estado>
  if (!data.length) return <Estado>{t('cajas.sin_cajas')}</Estado>

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
            <MobileCard key={`${r.tipo}-${r.id}`}>
              <CardHeader>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <TipoBadge $tipo={r.tipo}>{labelTipo(r.tipo)}</TipoBadge>
                  <span style={{ fontSize: '0.85rem' }}>{r.ubicacion}</span>
                </div>
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
              </CardHeader>
              <MobileCardRow label={t('cajas.cantidad')} value={<strong>{r.cantidad}</strong>} />
              <MobileCardRow
                label={t('cajas.fecha_caducidad')}
                value={<CaducidadCell fecha={r.fecha_caducidad} />}
              />
              <MobileCardRow label={t('cajas.fecha_entrada')} value={formatFecha(r.fecha_entrada)} />
              {r.codigo_barras && (
                <MobileCardRow label={t('cajas.codigo_barras')} value={r.codigo_barras} />
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

const TipoBadge = styled.span<{ $tipo: TipoRegistro }>`
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  background: ${({ $tipo, theme }) => {
    if ($tipo === 'caja') return `${theme.primary}20`
    if ($tipo === 'suelto') return `${theme.warning}20`
    return `${theme.danger}20`
  }};
  color: ${({ $tipo, theme }) => {
    if ($tipo === 'caja') return theme.primary
    if ($tipo === 'suelto') return theme.warning
    return theme.danger
  }};
`

const CaducidadText = styled.span<{ $nivel: 'expirado' | 'urgente' | 'proximo' }>`
  font-weight: 600;
  color: ${({ $nivel, theme }) => {
    if ($nivel === 'expirado') return theme.danger
    if ($nivel === 'urgente') return theme.danger
    return theme.warning
  }};
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
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
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
