import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Space,
  Checkbox,
  Select,
  Card,
  Modal,
  Popconfirm,
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Option } = Select;

const ProductForm = () => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [imageUrl, setImageUrl] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/categories`
        );
        setCategories(response.data);
      } catch (error) {
        message.error("Failed to load categories");
      }
    };
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/products`
      );
      setProducts(response.data);
    } catch (error) {
      message.error("Failed to load products");
    }
  };

  const handleImageUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/upload`, formData);
      // console.log("res: ",response);
      const url = response.data.imageUrl;
      let images = [...imageUrl];
      images.push(url);
      // console.log("images: ",images)
      setImageUrl(images);
      onSuccess(images);
      message.success('Image uploaded successfully');
    } catch (error) {
      onError(error);
      console.log("error: ",error)
      message.error('Image upload failed');
    }
  };

  const onFinish = async (values) => {
    try {
      const processedValues = {
        ...values,
        ProductId: editingProduct?.ProductId || values?.ProductId,
        Variants: values?.Variants?.map((variant) => ({
          ...variant,
          Colors: variant?.Colors?.map((color) => ({
            ...color,
            // Extract only the image URLs
            Images: imageUrl, // Since `img` is already the URL
          })),
        })),
      };

      if (editingProduct) {
        console.log("editing prod:" , editingProduct)
        await axios.put(
          `${import.meta.env.VITE_API_URL}/products/${
            editingProduct.ProductId
          }`,
          processedValues
        );
        message.success("Product updated successfully");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/products`,
          processedValues
        );
        message.success("Product added successfully");
      }
      form.resetFields();
      fetchProducts();
      setIsModalOpen(false);
      setImageUrl([]);
    } catch (error) {
      console.log("error: ",error)
      message.error(
        editingProduct ? "Failed to update product" : "Failed to add product"
      );
    }
  };

  const handleEdit = (product) => {
    console.log("product: ",product)
    setEditingProduct(product);
    form.setFieldsValue({
      ProductName: product?.ProductName,
      ProductId: product?.ProductId,
      Type: product?.Type,
      Material: product?.Material,
      Description: product?.Description,
      CategoryID: product?.CategoryID,
      Category: product?.CategoryName,
      IsRecommended: product?.IsRecommended,
      Variants: product?.Variants?.map((variant) => ({
        ...variant,
        Colors: variant?.Colors?.map((color) => ({
          ...color,
          Images: color?.Images?.map((img) => img?.file?.response),
        })),
        Sizes: variant?.Sizes,
      })),
    });
    // setImageUrl(product?.Variants[0]?.Colors[0]?.Images?.[0] || "");
    setImageUrl(product?.Variants[0]?.Colors[0]?.Images?.[0] ?? "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`);
      message.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      message.error("Failed to delete product");
    }
  };

  const handleRemoveImage = (index) => {
    let images = [...imageUrl];
    images.splice(index, 1);
    setImageUrl(images);
  };

  return (
    <>
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl mx-auto mt-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Add New Product
        </h2>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Product Name"
            name="ProductName"
            rules={[
              { required: true, message: "Please input the Product Name!" },
            ]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>
          <Form.Item label="Type" name="Type">
            <Input placeholder="Enter product type" />
          </Form.Item>
          <Form.Item label="Material" name="Material">
            <Input placeholder="Enter material" />
          </Form.Item>
          <Form.Item label="Description" name="Description">
            <Input.TextArea placeholder="Enter product description" rows={4} />
          </Form.Item>

          <Form.Item
            label="Category"
            name="CategoryID"
            rules={[{ required: true, message: "Please select a Category!" }]}
          >
            <Select placeholder="Select a category">
              {categories.map((category) => (
                <Option key={category.CategoryID} value={category.CategoryID}>
                  {category.CategoryName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Is Recommended"
            name="IsRecommended"
            valuePropName="checked"
          >
            <Checkbox>Recommended</Checkbox>
          </Form.Item>

          <Form.List name="Variants">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <div key={key} className="bg-gray-100 p-4 rounded-lg mb-4">
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Variant
                    </h3>
                    <Space
                      direction="vertical"
                      size="middle"
                      style={{ display: "flex" }}
                    >
                      <Form.Item
                        {...restField}
                        label="Variant ID"
                        name={[name, "VariantID"]}
                        fieldKey={[fieldKey, "VariantID"]}
                        rules={[
                          {
                            required: true,
                            message: "Please input the Variant ID!",
                          },
                        ]}
                      >
                        <Input placeholder="Enter variant ID" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Finish"
                        name={[name, "Finish"]}
                        fieldKey={[fieldKey, "Finish"]}
                      >
                        <Input placeholder="Enter finish" />
                      </Form.Item>

                      <Form.List name={[name, "Colors"]}>
                        {(
                          colorFields,
                          { add: addColor, remove: removeColor }
                        ) => (
                          <>
                            {colorFields.map(
                              ({
                                key: colorKey,
                                name: colorName,
                                fieldKey: colorFieldKey,
                                ...colorRestField
                              }) => (
                                <div
                                  key={colorKey}
                                  className="bg-white p-4 rounded-lg mb-4 shadow-sm"
                                >
                                  <h4 className="text-md font-semibold text-gray-500 mb-2">
                                    Color
                                  </h4>
                                  <Form.Item
                                    {...colorRestField}
                                    label="Color Name"
                                    name={[colorName, "ColorName"]}
                                    fieldKey={[colorFieldKey, "ColorName"]}
                                    rules={[
                                      {
                                        required: true,
                                        message: "Please input the Color Name!",
                                      },
                                    ]}
                                  >
                                    <Input placeholder="Enter color name" />
                                  </Form.Item>
                                  <Form.Item
                                    {...colorRestField}
                                    label="Edge"
                                    name={[colorName, "Edge"]}
                                    fieldKey={[colorFieldKey, "Edge"]}
                                  >
                                    <Input placeholder="Enter edge type" />
                                  </Form.Item>

                                  <Form.List name={[colorName, "Images"]}>
                                    {(
                                      imageFields,
                                      { add: addImage, remove: removeImage }
                                    ) => (
                                      <>
                                        {imageFields.map(
                                          ({
                                            key: imageKey,
                                            name: imageName,
                                            fieldKey: imageFieldKey,
                                            ...imageRestField
                                          }) => (
                                            <div
                                              key={imageKey}
                                              className="flex items-center mb-4"
                                            >
                                              <Form.Item
                                                {...imageRestField}
                                                label="Image"
                                                name={[imageName, "url"]}
                                                fieldKey={[
                                                  imageFieldKey,
                                                  "url",
                                                ]}
                                              >
                                                <Upload
                                                  customRequest={
                                                    handleImageUpload
                                                  }
                                                  listType="picture"
                                                  maxCount={1}
                                                  showUploadList={false}
                                                >
                                                  <Button
                                                    icon={<UploadOutlined />}
                                                  >
                                                    Upload Image
                                                  </Button>
                                                </Upload>
                                              </Form.Item>
                                              {imageUrl.length > 0 && (
                                                <div className="ml-4 relative">
                                                  <img
                                                    src={imageUrl[imageKey]}
                                                    alt="Uploaded Image"
                                                    className="w-20 h-20 object-cover"
                                                  />
                                                  <button
                                                    className="absolute top-0 right-0 bg-red-500 text-white p-1 hover:bg-red-700"
                                                    onClick={() =>
                                                      handleRemoveImage(
                                                        imageKey
                                                      )
                                                    }
                                                  >
                                                    X
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          )
                                        )}
                                        <Button
                                          type="dashed"
                                          onClick={() => addImage()}
                                          block
                                          icon={<PlusOutlined />}
                                        >
                                          Add Image
                                        </Button>
                                      </>
                                    )}
                                  </Form.List>

                                  <Button
                                    type="dashed"
                                    danger
                                    onClick={() => removeColor(colorName)}
                                    block
                                    icon={<MinusCircleOutlined />}
                                  >
                                    Remove Color
                                  </Button>
                                </div>
                              )
                            )}
                            <Button
                              type="dashed"
                              onClick={() => addColor()}
                              block
                              icon={<PlusOutlined />}
                            >
                              Add Color
                            </Button>
                          </>
                        )}
                      </Form.List>

                      {/* Sizes Section */}
                      <Form.List name={[name, "Sizes"]}>
                        {(sizeFields, { add: addSize, remove: removeSize }) => (
                          <>
                            {sizeFields.map(
                              ({
                                key: sizeKey,
                                name: sizeName,
                                fieldKey: sizeFieldKey,
                                ...sizeRestField
                              }) => (
                                <div
                                  key={sizeKey}
                                  className="bg-white p-4 rounded-lg mb-4 shadow-sm"
                                >
                                  <h4 className="text-md font-semibold text-gray-500 mb-2">
                                    Size
                                  </h4>
                                  <Form.Item
                                    {...sizeRestField}
                                    label="Length"
                                    name={[sizeName, "Length"]}
                                    fieldKey={[sizeFieldKey, "Length"]}
                                    rules={[
                                      {
                                        required: true,
                                        message: "Please input the Length!",
                                      },
                                    ]}
                                  >
                                    <Input placeholder="Enter length" />
                                  </Form.Item>
                                  <Form.Item
                                    {...sizeRestField}
                                    label="Width"
                                    name={[sizeName, "Width"]}
                                    fieldKey={[sizeFieldKey, "Width"]}
                                    rules={[
                                      {
                                        required: true,
                                        message: "Please input the Width!",
                                      },
                                    ]}
                                  >
                                    <Input placeholder="Enter width" />
                                  </Form.Item>
                                  <Form.Item
                                    {...sizeRestField}
                                    label="Thickness"
                                    name={[sizeName, "Thickness"]}
                                    fieldKey={[sizeFieldKey, "Thickness"]}
                                    rules={[
                                      {
                                        required: true,
                                        message: "Please input the Thickness!",
                                      },
                                    ]}
                                  >
                                    <Input placeholder="Enter thickness" />
                                  </Form.Item>

                                  <Button
                                    type="dashed"
                                    danger
                                    onClick={() => removeSize(sizeName)}
                                    block
                                    icon={<MinusCircleOutlined />}
                                  >
                                    Remove Size
                                  </Button>
                                </div>
                              )
                            )}
                            <Button
                              type="dashed"
                              onClick={() => addSize()}
                              block
                              icon={<PlusOutlined />}
                            >
                              Add Size
                            </Button>
                          </>
                        )}
                      </Form.List>

                      <Button
                        type="dashed"
                        danger
                        onClick={() => remove(name)}
                        block
                        icon={<MinusCircleOutlined />}
                      >
                        Remove Variant
                      </Button>
                    </Space>
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  className="mt-4"
                >
                  Add Variant
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="mt-6">
              {editingProduct ? "Update Product" : "Add Product"}
            </Button>
          </Form.Item>
        </Form>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl mx-auto mt-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Product List
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {products.map((product) => (
            <Card
              key={product.ProductId}
              title={product.ProductName}
              extra={<span>{product.Type}</span>}
            >
              <p>
                <strong>Material:</strong> {product.Material}
              </p>
              <p>
                <strong>Description:</strong> {product.Description}
              </p>
              <p>
                <strong>Category:</strong>{" "}
                {
                  categories.find(
                    (cat) => cat.CategoryID === product.CategoryID
                  )?.CategoryName
                }
              </p>
              <p>
                <strong>Is Recommended:</strong>{" "}
                {product.IsRecommended ? "Yes" : "No"}
              </p>
              <div className="flex justify-between mt-4">
                <Button
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(product)}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Are you sure you want to delete this product?"
                  onConfirm={() => handleDelete(product.ProductId)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button icon={<DeleteOutlined />} danger>
                    Delete
                  </Button>
                </Popconfirm>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal
        title="Edit Product"
        visible={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
          form.resetFields();
          setImageUrl("");
        }}
        footer={null}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Product Name"
            name="ProductName"
            rules={[
              { required: true, message: "Please input the Product Name!" },
            ]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>
          <Form.Item label="Type" name="Type">
            <Input placeholder="Enter product type" />
          </Form.Item>
          <Form.Item label="Material" name="Material">
            <Input placeholder="Enter material" />
          </Form.Item>
          <Form.Item label="Description" name="Description">
            <Input.TextArea placeholder="Enter product description" rows={4} />
          </Form.Item>

          <Form.Item
            label="Category"
            name="CategoryID"
            rules={[{ required: true, message: "Please select a Category!" }]}
          >
            <Select placeholder="Select a category">
              {categories.map((category) => (
                <Option key={category.CategoryID} value={category.CategoryID}>
                  {category.CategoryName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Is Recommended"
            name="IsRecommended"
            valuePropName="checked"
          >
            <Checkbox>Recommended</Checkbox>
          </Form.Item>

          <Form.List name="Variants">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <div key={key} className="bg-gray-100 p-4 rounded-lg mb-4">
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Variant
                    </h3>
                    <Space
                      direction="vertical"
                      size="middle"
                      style={{ display: "flex" }}
                    >
                      <Form.Item
                        {...restField}
                        label="Variant ID"
                        name={[name, "VariantID"]}
                        fieldKey={[fieldKey, "VariantID"]}
                        rules={[
                          {
                            required: true,
                            message: "Please input the Variant ID!",
                          },
                        ]}
                      >
                        <Input placeholder="Enter variant ID" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Finish"
                        name={[name, "Finish"]}
                        fieldKey={[fieldKey, "Finish"]}
                      >
                        <Input placeholder="Enter finish" />
                      </Form.Item>

                      <Form.List name={[name, "Colors"]}>
                        {(
                          colorFields,
                          { add: addColor, remove: removeColor }
                        ) => (
                          <>
                            {colorFields.map(
                              ({
                                key: colorKey,
                                name: colorName,
                                fieldKey: colorFieldKey,
                                ...colorRestField
                              }) => (
                                <div
                                  key={colorKey}
                                  className="bg-white p-4 rounded-lg mb-4 shadow-sm"
                                >
                                  <h4 className="text-md font-semibold text-gray-500 mb-2">
                                    Color
                                  </h4>
                                  <Form.Item
                                    {...colorRestField}
                                    label="Color Name"
                                    name={[colorName, "ColorName"]}
                                    fieldKey={[colorFieldKey, "ColorName"]}
                                    rules={[
                                      {
                                        required: true,
                                        message: "Please input the Color Name!",
                                      },
                                    ]}
                                  >
                                    <Input placeholder="Enter color name" />
                                  </Form.Item>
                                  <Form.Item
                                    {...colorRestField}
                                    label="Edge"
                                    name={[colorName, "Edge"]}
                                    fieldKey={[colorFieldKey, "Edge"]}
                                  >
                                    <Input placeholder="Enter edge type" />
                                  </Form.Item>

                                  <Form.List name={[colorName, "Images"]}>
                                    {(
                                      imageFields,
                                      { add: addImage, remove: removeImage }
                                    ) => (
                                      <>
                                        {imageFields.map(
                                          ({
                                            key: imageKey,
                                            name: imageName,
                                            fieldKey: imageFieldKey,
                                            ...imageRestField
                                          }) => (
                                            <div
                                              key={imageKey}
                                              className="flex items-center mb-4"
                                            >
                                              <Form.Item
                                                {...imageRestField}
                                                label="Image"
                                                name={[imageName, "url"]}
                                                fieldKey={[
                                                  imageFieldKey,
                                                  "url",
                                                ]}
                                              >
                                                <Upload
                                                  customRequest={
                                                    handleImageUpload
                                                  }
                                                  listType="picture"
                                                  maxCount={1}
                                                  showUploadList={false}
                                                >
                                                  <Button
                                                    icon={<UploadOutlined />}
                                                  >
                                                    Upload Image
                                                  </Button>
                                                </Upload>
                                              </Form.Item>
                                              {imageUrl.length > 0 && (
                                                <div className="ml-4 relative">
                                                  <img
                                                    src={imageUrl[imageKey]}
                                                    alt="Uploaded Image"
                                                    className="w-20 h-20 object-cover"
                                                  />
                                                  <button
                                                    className="absolute top-0 right-0 bg-red-500 text-white p-1 hover:bg-red-700"
                                                    onClick={() =>
                                                      handleRemoveImage(
                                                        imageKey
                                                      )
                                                    }
                                                  >
                                                    X
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          )
                                        )}
                                        <Button
                                          type="dashed"
                                          onClick={() => addImage()}
                                          block
                                          icon={<PlusOutlined />}
                                        >
                                          Add Image
                                        </Button>
                                      </>
                                    )}
                                  </Form.List>

                                  <Button
                                    type="dashed"
                                    danger
                                    onClick={() => removeColor(colorName)}
                                    block
                                    icon={<MinusCircleOutlined />}
                                  >
                                    Remove Color
                                  </Button>
                                </div>
                              )
                            )}
                            <Button
                              type="dashed"
                              onClick={() => addColor()}
                              block
                              icon={<PlusOutlined />}
                            >
                              Add Color
                            </Button>
                          </>
                        )}
                      </Form.List>

                      <Form.List name={[name, "Sizes"]}>
                        {(sizeFields, { add: addSize, remove: removeSize }) => (
                          <>
                            {sizeFields.map(
                              ({
                                key: sizeKey,
                                name: sizeName,
                                fieldKey: sizeFieldKey,
                                ...sizeRestField
                              }) => (
                                <div
                                  key={sizeKey}
                                  className="bg-white p-4 rounded-lg mb-4 shadow-sm"
                                >
                                  <h4 className="text-md font-semibold text-gray-500 mb-2">
                                    Size
                                  </h4>
                                  <Form.Item
                                    {...sizeRestField}
                                    label="Length"
                                    name={[sizeName, "Length"]}
                                    fieldKey={[sizeFieldKey, "Length"]}
                                    rules={[
                                      {
                                        required: true,
                                        message: "Please input the Length!",
                                      },
                                    ]}
                                  >
                                    <Input placeholder="Enter length" />
                                  </Form.Item>
                                  <Form.Item
                                    {...sizeRestField}
                                    label="Width"
                                    name={[sizeName, "Width"]}
                                    fieldKey={[sizeFieldKey, "Width"]}
                                    rules={[
                                      {
                                        required: true,
                                        message: "Please input the Width!",
                                      },
                                    ]}
                                  >
                                    <Input placeholder="Enter width" />
                                  </Form.Item>
                                  <Form.Item
                                    {...sizeRestField}
                                    label="Thickness"
                                    name={[sizeName, "Thickness"]}
                                    fieldKey={[sizeFieldKey, "Thickness"]}
                                    rules={[
                                      {
                                        required: true,
                                        message: "Please input the Thickness!",
                                      },
                                    ]}
                                  >
                                    <Input placeholder="Enter thickness" />
                                  </Form.Item>

                                  <Button
                                    type="dashed"
                                    danger
                                    onClick={() => removeSize(sizeName)}
                                    block
                                    icon={<MinusCircleOutlined />}
                                  >
                                    Remove Size
                                  </Button>
                                </div>
                              )
                            )}
                            <Button
                              type="dashed"
                              onClick={() => addSize()}
                              block
                              icon={<PlusOutlined />}
                            >
                              Add Size
                            </Button>
                          </>
                        )}
                      </Form.List>

                      <Button
                        type="dashed"
                        danger
                        onClick={() => remove(name)}
                        block
                        icon={<MinusCircleOutlined />}
                      >
                        Remove Variant
                      </Button>
                    </Space>
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  className="mt-4"
                >
                  Add Variant
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="mt-6">
              {editingProduct ? "Update Product" : "Add Product"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ProductForm;
