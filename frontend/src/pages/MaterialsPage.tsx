import { useState, useRef } from "react"
import { Card, Upload, Select, Input, Grid, Image, message, Spin } from "antd"
import { InboxOutlined, SearchOutlined } from "@ant-design/icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { materialsApi } from "../services/api"

const { Dragger } = Upload
const { useBreakpoint } = Grid

const typeOptions = [
  { value: "video", label: "视频" },
  { value: "image", label: "图片" },
  { value: "audio", label: "音频" },
  { value: "voiceover", label: "配音" },
]

export function MaterialsPage() {
  const [type, setType] = useState<string>("")
  const [keyword, setKeyword] = useState("")
  const queryClient = useQueryClient()
  const [page] = [1]

  const { data, isLoading } = useQuery({
    queryKey: ["materials", type, keyword],
    queryFn: () => materialsApi.list({ page, page_size: 20, material_type: type, keyword }),
  })

  const uploadMutation = useMutation({
    mutationFn: materialsApi.upload,
    onSuccess: () => {
      message.success("上传成功")
      queryClient.invalidateQueries({ queryKey: ["materials"] })
    },
    onError: () => {
      message.error("上传失败")
    },
  })

  const materials = data?.data?.items || []

  const uploadProps = {
    name: "file",
    multiple: true,
    showUploadList: false,
    beforeUpload: (file: File) => {
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
      <Dragger {...uploadProps} className="upload-drag">
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽上传素材</p>
        <p className="ant-upload-hint">支持视频、图片、音频等格式</p>
      </Dragger>

      {/* 筛选 */}
      <div className="flex gap-2">
        <Select
          placeholder="素材类型"
          allowClear
          options={typeOptions}
          value={type || undefined}
          onChange={setType}
          className="w-28"
        />
        <Input
          prefix={<SearchOutlined />}
          placeholder="搜索素材"
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
          <div className="text-center text-gray-400 py-10">暂无素材</div>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {materials.map((m: any) => (
            <div key={m.id} className="relative group">
              {m.material_type === "image" || m.thumbnail_url ? (
                <Image
                  src={m.thumbnail_url || m.oss_url}
                  className="w-full aspect-square object-cover rounded"
                  preview
                />
              ) : (
                <div className="w-full aspect-square bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-2xl">🎬</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate rounded-b">
                {m.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
