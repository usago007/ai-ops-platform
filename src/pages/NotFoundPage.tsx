import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

export const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Result
        status="404"
        title="404"
        subTitle="Page not found. The page you are looking for does not exist or has been moved."
        extra={<Button type="primary" onClick={() => navigate('/')}>Back to Dashboard</Button>}
      />
    </div>
  )
}
