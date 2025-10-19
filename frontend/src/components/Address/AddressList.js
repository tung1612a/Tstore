"use client"

import { useState, useEffect } from "react"
import { Container, Card, Button, Alert, Spinner } from "react-bootstrap"
import "./AddressList.css"

const AddressList = ({ refreshTrigger, onEdit }) => {
    const [addresses, setAddresses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        fetchAddresses()
    }, [refreshTrigger])

    const fetchAddresses = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const response = await fetch("http://localhost:5000/api/address", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error("Lỗi khi lấy danh sách địa chỉ")
            }

            const data = await response.json()
            setAddresses(data)
            setError("")
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa địa chỉ này?")) return

        try {
            const token = localStorage.getItem("token")
            const response = await fetch(`http://localhost:5000/api/address/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error("Lỗi khi xóa địa chỉ")
            }

            setAddresses(addresses.filter((addr) => addr._id !== id))
        } catch (err) {
            setError(err.message)
        }
    }

    if (loading) {
        return (
            <Container className="text-center mt-4">
                <Spinner animation="border" />
            </Container>
        )
    }

    return (
        <Container className="address-list-container mt-4">
            <h3>Danh sách địa chỉ</h3>

            {error && <Alert variant="danger">{error}</Alert>}

            {addresses.length === 0 ? (
                <Alert variant="info">Bạn chưa có địa chỉ nào. Hãy thêm một địa chỉ mới!</Alert>
            ) : (
                <div className="address-cards">
                    {addresses.map((address) => (
                        <Card key={address._id} className="mb-3 address-card">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <Card.Title>{address.fullName}</Card.Title>
                                        <Card.Text>
                                            <strong>Số điện thoại:</strong> {address.phone}
                                            <br />
                                            <strong>Địa chỉ:</strong> {address.street}
                                            <br />
                                            <strong>Thành phố:</strong> {address.city}
                                            <br />
                                            <strong>Tỉnh/Bang:</strong> {address.state}
                                            <br />
                                            <strong>Quốc gia:</strong> {address.country}
                                        </Card.Text>
                                        {address.isDefault && <span className="badge bg-success">Địa chỉ mặc định</span>}
                                    </div>
                                    <div className="address-actions">
                                        <Button variant="warning" size="sm" onClick={() => onEdit(address)} className="me-2">
                                            Sửa
                                        </Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(address._id)}>
                                            Xóa
                                        </Button>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}
        </Container>
    )
}

export default AddressList
