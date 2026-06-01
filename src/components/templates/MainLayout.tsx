import { Outlet } from 'react-router-dom'
import styled from 'styled-components'

// Shell de layout para todas las rutas autenticadas.
// El Sidebar y el proveedor de tema se integran en el Bloque 3.
const Wrapper = styled.div`
  display: flex;
  min-height: 100vh;
`

const Content = styled.main`
  flex: 1;
  padding: 1.5rem;
`

export default function MainLayout() {
  return (
    <Wrapper>
      <Content>
        <Outlet />
      </Content>
    </Wrapper>
  )
}
