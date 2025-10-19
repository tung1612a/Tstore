"use client"

import { useState, useEffect } from "react"
import { Container, Tabs, Tab, Alert } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import AddressForm from "./AddressForm"
import AddressList from "./AddressList"
import "./AddressPage.css"

const AddressPage = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [editingAddress, setEditingAddress] = useState(null)
    const [activeTab, setActiveTab] = useState("list")
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            setIsAuthenticated(false)
            setLoading(false)
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate("/login")
            }, 2000)
        } else {
            setIsAuthenticated(true)
            setLoading(false)
        }
    }, [navigate])

    const handleAddressAdded = () => {
        setRefreshTrigger((prev) => prev + 1)
        setActiveTab("list")
    }

    const handleEdit = (address) => {
        setEditingAddress(address)
        setActiveTab("form")
    }

    const handleEditComplete = () => {
        setEditingAddress(null)
        setRefreshTrigger((prev) => prev + 1)
        setActiveTab("list")
    }

    if (loading) {
        return (
            <Container className="address-page mt-5 mb-5">
                <Alert variant="info">Đang kiểm tra xác thực...</Alert>
            </Container>
        )
    }

    if (!isAuthenticated) {
        return (
            <Container className="address-page mt-5 mb-5">
                <Alert variant="warning">Bạn cần đăng nhập để xem địa chỉ. Đang chuyển hướng đến trang đăng nhập...</Alert>
            </Container>
        )
    }

    return (
        <Container className="address-page mt-5 mb-5">
            <h1 className="mb-4">Quản lý địa chỉ</h1>

            <Tabs id="address-tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                <Tab eventKey="list" title="Danh sách địa chỉ">
                    <AddressList refreshTrigger={refreshTrigger} onEdit={handleEdit} />
                </Tab>
                <Tab eventKey="form" title={editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}>
                    <AddressForm
                        onAddressAdded={handleAddressAdded}
                        editingAddress={editingAddress}
                        onEditComplete={handleEditComplete}
                    />
                </Tab>
            </Tabs>
        </Container>
    )
}

export default AddressPage
