"use client"

import { useState, useEffect } from "react"
import { Button, Form, Container, Alert } from "react-bootstrap"
import "./AddressForm.css"

const AddressForm = ({ onAddressAdded, editingAddress, onEditComplete }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        country: "",
        isDefault: false,
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    useEffect(() => {
        if (editingAddress) {
            setFormData(editingAddress)
        } else {
            setFormData({
                fullName: "",
                phone: "",
                street: "",
                city: "",
                state: "",
                country: "",
                isDefault: false,
            })
        }
    }, [editingAddress])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccess("")

        try {
            const token = localStorage.getItem("token")
            const url = editingAddress
                ? `http://localhost:5000/api/address/${editingAddress._id}`
                : "http://localhost:5000/api/address"
            const method = editingAddress ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                throw new Error("Lỗi khi lưu địa chỉ")
            }

            setSuccess(editingAddress ? "Cập nhật địa chỉ thành công!" : "Thêm địa chỉ thành công!")
            setFormData({
                fullName: "",
                phone: "",
                street: "",
                city: "",
                state: "",
                country: "",
                isDefault: false,
            })

            if (onAddressAdded) onAddressAdded()
            if (onEditComplete) onEditComplete()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Container className="address-form-container mt-4">
            <h3>{editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}</h3>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Họ và tên</Form.Label>
                    <Form.Control
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Nhập họ và tên"
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Số điện thoại</Form.Label>
                    <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Nhập số điện thoại"
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Địa chỉ</Form.Label>
                    <Form.Control
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        placeholder="Nhập địa chỉ"
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Thành phố</Form.Label>
                    <Form.Control
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Nhập thành phố"
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Tỉnh/Bang</Form.Label>
                    <Form.Control
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Nhập tỉnh/bang"
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Quốc gia</Form.Label>
                    <Form.Control
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="Nhập quốc gia"
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Check
                        type="checkbox"
                        name="isDefault"
                        label="Đặt làm địa chỉ mặc định"
                        checked={formData.isDefault}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? "Đang lưu..." : editingAddress ? "Cập nhật" : "Thêm"}
                </Button>
            </Form>
        </Container>
    )
}








export default AddressForm
