import { useState, useEffect } from "react"
import { Card, Input, Button, Checkbox, message } from "antd"
import { useNavigate } from "react-router-dom"

const STORAGE_KEY_PHONE = "remembered_phone"

export function LoginPage() {
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [remember, setRemember] = useState(false)
  const [sending, setSending] = useState(false)
  const [loggingIn, setLoggingIn] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const navigate = useNavigate()

  // 加载记住的手机号
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PHONE)
    if (saved) {
      setPhone(saved)
      setRemember(true)
    }
  }, [])

  const sendCode = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      message.error("请输入正确的手机号")
      return
    }
    setSending(true)
    try {
      const res = await fetch(`/api/v1/auth/send-code?phone=${phone}`, { method: "POST" })
      const data = await res.json()
      if (data.success) {
        message.success("验证码已发送")
        setCountdown(60)
        const t = setInterval(() => {
          setCountdown(c => {
            if (c <= 1) { clearInterval(t); return 0 }
            return c - 1
          })
        }, 1000)
      } else {
        message.error(data.detail || "发送失败")
      }
    } catch {
      message.error("网络错误，请检查网络连接")
    } finally {
      setSending(false)
    }
  }

  const login = async () => {
    if (!code || code.length !== 6) {
      message.error("请输入6位验证码")
      return
    }
    setLoggingIn(true)
    try {
      const res = await fetch(`/api/v1/auth/login?phone=${phone}&code=${code}`, { method: "POST" })
      const data = await res.json()
      if (data.access_token) {
        // 记住账号
        if (remember) {
          localStorage.setItem(STORAGE_KEY_PHONE, phone)
        } else {
          localStorage.removeItem(STORAGE_KEY_PHONE)
        }
        localStorage.setItem("token", data.access_token)
        localStorage.setItem("user", JSON.stringify(data.user))
        message.success("登录成功")
        navigate("/")
      } else {
        message.error(data.detail || "登录失败")
      }
    } catch {
      message.error("网络错误，请检查网络连接")
    } finally {
      setLoggingIn(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6 bg-white/90 backdrop-blur rounded-2xl shadow-xl" bordered={false}>
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎬</div>
          <h1 className="text-xl font-bold text-gray-800">短视频工厂</h1>
          <p className="text-sm text-gray-500 mt-1">登录后开始创作</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">手机号</label>
            <Input
              size="large"
              placeholder="请输入手机号"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              maxLength={11}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">验证码</label>
            <div className="flex gap-2">
              <Input
                size="large"
                placeholder="请输入验证码"
                value={code}
                onChange={e => setCode(e.target.value)}
                maxLength={6}
                className="flex-1"
                onPressEnter={login}
              />
              <Button
                size="large"
                onClick={sendCode}
                disabled={countdown > 0}
                loading={sending}
              >
                {countdown > 0 ? `${countdown}s` : "获取验证码"}
              </Button>
            </div>
          </div>

          <Checkbox checked={remember} onChange={e => setRemember(e.target.checked)}>
            记住账号
          </Checkbox>

          <Button
            size="large"
            block
            type="primary"
            onClick={login}
            loading={loggingIn}
            className="mt-2"
          >
            登录
          </Button>

          <p className="text-xs text-gray-400 text-center">
            演示阶段验证码固定为 <strong>123456</strong>
          </p>
        </div>
      </Card>
    </div>
  )
}
