import { useState } from "react"
import { Card, Upload, Select, Input, Image, message, Spin, Modal } from "antd"
import { InboxOutlined, SearchOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { materialsApi } from "../services/api"

const { Dragger } = Upload

const typeOptions = [
  { value: "", label: "全部" },
  { value: "video", label: "视频" },
  { value: "image", label: "图片" },
  { value: "audio", label: "音频" },
  { value: "voiceover", label: "配音" },
]

export function MaterialsPage() {
  const [type, setType] = useState<string>("")
  const [keyword, setKeyword] = useState("")
  const [uploadingCount, setUploadingCount] = useState(0)
  const [previewItem, setPreviewItem] = useState<any>(null)
  const queryClient = useQueryClient()
  const [page] = [1]

  const { data, isLoading } = useQuery({
    queryKey: ["materials", type, keyword],
    queryFn: () => materialsApi.list({ page, page_size: 20, material_type: type || undefined, keyword }),
  })

  const uploadMutation = useMutation({
    mutationFn: materialsApi.upload,
    onSuccess: () => {
      message.success("上传成功")
      queryClient.invalidateQueries({ queryKey: ["materials"] })
    },
    onError: () => {
      message.error("上传失败，请重试")
    },
    onSettled: () => {
      setUploadingCount(c => Math.max(0, c - 1))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: materialsApi.delete,
    onSuccess: () => {
      message.success("已删除")
      queryClient.invalidateQueries({ queryKey: ["materials"] })
    },
    onError: () => {
      message.error("删除失败")
    },
  })

  const materials = data?.data?.items || []

  const uploadProps = {
    name: "file",
    multiple: true,
    showUploadList: false,
    beforeUpload: (file: File) => {
      setUploadingCount(c => c + 1)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("material_type", type || "image")
      uploadMutation.mutate(formData)
      return false
    },
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">素材中心</h1>

      {/* 上传区域 */}
      <Dragger {...uploadProps} className="upload-drag" disabled={uploadMutation.isPending}>
        <p className="ant-upload-drag-icon">
          {uploadMutation.isPending ? <Spin size="large" /> : <InboxOutlined />}
        </p>
        <p className="ant-upload-text">
          {uploadMutation.isPending ? "上传中..." : "点击或拖拽上传素材"}
        </p>
        <p className="ant-upload-hint">支持视频、图片、音频，单文件最大 500MB</p>
      </Dragger>

      {/* 上传进度 */}
      {uploadingCount > 0 && (
        <Card size="small">
          <div className="flex items-center gap-2">
            <Spin size="small" />
            <span className="text-sm">正在上传 {uploadingCount} 个文件...</span>
          </div>
        </Card>
      )}

      {/* 筛选 */}
      <div className="flex gap-2">
        <Select
          options={typeOptions}
          value={type || ""}
          onChange={setType}
          className="w-28"
        />
        <Input
          prefix={<SearchOutlined />}
          placeholder="搜索素材名称"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* 素材列表 */}
      {isLoading ? (
        <div className="text-center py-10">
          <Spin />
        </div>
      ) : materials.length === 0 ? (
        <Card>
          <div className="text-center text-gray-400 py-10">
            {keyword || type ? "没有找到符合条件的素材" : "暂无素材，点击上方区域上传"}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {materials.map((m: any) => (
            <div key={m.id} className="relative group">
              {m.material_type === "image" ? (
                <Image
                  src={m.thumbnail_url || m.url}
                  className="w-full aspect-square object-cover rounded cursor-pointer"
                  preview={false}
                  onClick={() => setPreviewItem(m)}
                />
              ) : (
                <div
                  className="w-full aspect-square bg-gray-100 rounded flex flex-col items-center justify-center cursor-pointer"
                  onClick={() => setPreviewItem(m)}
                >
                  <span className="text-3xl">
                    {m.material_type === "video" ? "🎬" : m.material_type === "audio" ? "🎵" : "📁"}
                  </span>
                  <span className="text-xs text-gray-500 mt-1 truncate max-w-full px-1">{m.name}</span>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="w-6 h-6 bg-black/60 rounded flex items-center justify-center text-white hover:bg-black/80"
                  onClick={(e) => { e.stopPropagation(); setPreviewItem(m) }}
                >
                  <EyeOutlined className="text-xs" />
                </button>
                <button
                  className="w-6 h-6 bg-red-500/80 rounded flex items-center justify-center text-white hover:bg-red-500"
                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(m.id) }}
                >
                  <DeleteOutlined className="text-xs" />
                </button>
              </div>

              {/* 名称 */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate rounded-b">
                {m.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 预览弹窗 */}
      <Modal
        open={!!previewItem}
        onCancel={() => setPreviewItem(null)}
        footer={null}
        width={600}
        title={previewItem?.name}
      >
        {previewItem?.material_type === "image" ? (
          <img src={previewItem?.url || previewItem?.thumbnail_url} className="w-full" alt={previewItem?.name} />
        ) : (
          <div className="text-center py-10 text-gray-400">
            {previewItem?.material_type === "video" ? "🎬 视频预览" : "📁 暂无预览"}
            {previewItem?.url && (
              <div className="mt-4">
                <a href={previewItem.url} target="_blank" rel="noreferrer" className="text-purple-500 underline">
                  在新窗口打开
                </a>
              </div>
            )}
          </div>
        )}
        {previewItem && (
          <div className="mt-4 text-sm text-gray-500 space-y-1">
            <div>类型：{previewItem.material_type}</div>
            <div>大小：{previewItem.file_size ? `${(previewItem.file_size / 1024 / 1024).toFixed(2)} MB` : "未知"}</div>
            {previewItem.duration ? <div>时长：{previewItem.duration}s</div> : null}
          </div>
        )}
      </Modal>
    </div>
  )
}
