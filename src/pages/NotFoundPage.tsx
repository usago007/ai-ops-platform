import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

export const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className={styles.center}>
      <Result
        status="404"
        title="404"
        subTitle="Page not found. The page you are looking for does not exist or has been moved."
        extra={<Button type="primary" onClick={() => navigate('/')}>Back to Dashboard</Button>}
      />
    </div>
  )
}
