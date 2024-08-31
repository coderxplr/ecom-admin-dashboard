import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Table,
  Modal,
  message,
  Popconfirm,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";

const CategoryForm = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/categories`
      );
      setCategories(response.data);
    } catch (error) {
      message.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onFinish = async (values) => {
    try {
      if (editingCategory) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/categories/${
            editingCategory.CategoryID
          }`,
          {
            CategoryName: values.CategoryName,
            CategoryImage: imageUrl || editingCategory.CategoryImage,
          }
        );
        message.success("Category updated successfully");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/categories`, {
          CategoryName: values.CategoryName,
          CategoryImage: imageUrl,
        });
        message.success("Category added successfully");
      }
      setImageUrl("");
      setEditingCategory(null);
      form.resetFields();
      fetchCategories();
      setIsModalOpen(false);
    } catch (error) {
      message.error(
        editingCategory ? "Failed to update category" : "Failed to add category"
      );
    }
  };

  const handleImageUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/upload`,
        formData
      );
      setImageUrl(response.data.imageUrl);
      onSuccess(response.data.imageUrl);
      message.success("Image uploaded successfully");
    } catch (error) {
      onError(error);
      message.error("Image upload failed");
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      CategoryName: category.CategoryName,
    });
    setImageUrl(category.CategoryImage);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/categories/${id}`);
      message.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      message.error("Failed to delete category");
    }
  };

  const columns = [
    {
      title: "Category ID",
      dataIndex: "CategoryID",
      key: "CategoryID",
    },
    {
      title: "Category Name",
      dataIndex: "CategoryName",
      key: "CategoryName",
    },
    {
      title: "Category Image",
      dataIndex: "CategoryImage",
      key: "CategoryImage",
      render: (text) => (
        <img src={text} alt="Category" style={{ width: "50px" }} />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <span>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this category?"
            onConfirm={() => handleDelete(record.CategoryID)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg mx-auto mt-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Add New Category
        </h2>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Category Name"
            name="CategoryName"
            rules={[
              { required: true, message: "Please input the Category Name!" },
            ]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>
          <Form.Item label="Category Image">
            <Upload
              customRequest={handleImageUpload}
              listType="picture"
              maxCount={1}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Category"
                className="mt-4 rounded-md shadow-md"
              />
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="mt-6">
              {editingCategory ? "Update Category" : "Add Category"}
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div>
        <h3 className="text-2xl font-semibold text-gray-700 m-6">Category List</h3>
        <Table
          dataSource={categories}
          columns={columns}
          rowKey="_id"
          className="mt-8"
        />

        <Modal
          title="Edit Category"
          visible={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingCategory(null);
            form.resetFields();
            setImageUrl("");
          }}
          footer={null}
        >
          <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item
              label="Category Name"
              name="CategoryName"
              rules={[
                { required: true, message: "Please input the Category Name!" },
              ]}
            >
              <Input placeholder="Enter category name" />
            </Form.Item>
            <Form.Item label="Category Image">
              <Upload
                customRequest={handleImageUpload}
                listType="picture"
                maxCount={1}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Category"
                  className="mt-4 rounded-md shadow-md"
                />
              )}
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="mt-6">
                Update Category
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default CategoryForm;
