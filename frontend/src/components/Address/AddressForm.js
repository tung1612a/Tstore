"use client"

import { useState, useEffect, useRef } from "react"
import { Button, Form, Container, Alert } from "react-bootstrap"
import "./AddressForm.css"

const AddressForm = ({ onAddressAdded, editingAddress, onEditComplete }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        country: "Vietnam",
        isDefault: false,
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [provinceWardsMap, setProvinceWardsMap] = useState({})
    const [allProvinces, setAllProvinces] = useState([])
    const [currentWards, setCurrentWards] = useState([])
    const [loadingProvinces, setLoadingProvinces] = useState(false)
    const [provinceSearch, setProvinceSearch] = useState("")
    const [provinceResults, setProvinceResults] = useState([])
    const [showProvinceDropdown, setShowProvinceDropdown] = useState(false)
    const provinceSearchRef = useRef(null)
    const provinceDropdownRef = useRef(null)
    const [wardSearch, setWardSearch] = useState("")
    const [wardResults, setWardResults] = useState([])
    const [showWardDropdown, setShowWardDropdown] = useState(false)
    const wardSearchRef = useRef(null)
    const wardDropdownRef = useRef(null)

    useEffect(() => {
        if (editingAddress) {
            const nextData = {
                fullName: editingAddress.fullName || "",
                phone: editingAddress.phone || "",
                street: editingAddress.street || "",
                city: editingAddress.city || "",
                state: editingAddress.state || "",
                country: editingAddress.country || "Vietnam",
                isDefault: Boolean(editingAddress.isDefault),
            }
            setFormData(nextData)
            setProvinceSearch(nextData.state || "")
            setWardSearch(nextData.city || "")
        } else {
            const initialData = {
                fullName: "",
                phone: "",
                street: "",
                city: "",
                state: "",
                country: "Vietnam",
                isDefault: false,
            }
            setFormData(initialData)
            setProvinceSearch("")
            setWardSearch("")
        }
        setShowProvinceDropdown(false)
        setShowWardDropdown(false)
    }, [editingAddress])

    useEffect(() => {
        const fetchVietnamAddresses = async () => {
            try {
                setLoadingProvinces(true)
                const response = await fetch("http://localhost:5000/api/vietnam-addresses")

                if (!response.ok) {
                    throw new Error("Không thể tải danh sách tỉnh/thành")
                }

                const data = await response.json()
                const vietnamAddresses = data.data || []

                const map = {}
                const provinces = []

                vietnamAddresses.forEach((addr) => {
                    if (addr?.city) {
                        map[addr.city] = Array.isArray(addr.communes) ? addr.communes : []
                        provinces.push(addr.city)
                    }
                })

                provinces.sort((a, b) => a.localeCompare(b, "vi", { sensitivity: "base" }))

                setProvinceWardsMap(map)
                setAllProvinces(provinces)
                setProvinceResults(provinces)
            } catch (err) {
                console.error(err)
                setProvinceWardsMap({})
                setAllProvinces([])
            } finally {
                setLoadingProvinces(false)
            }
        }

        fetchVietnamAddresses()
    }, [])

    useEffect(() => {
        if (formData.state && provinceWardsMap[formData.state]) {
            const wards = provinceWardsMap[formData.state]
            setCurrentWards(wards)
            setWardResults(wards)
        } else {
            setCurrentWards([])
            setWardResults([])
        }
    }, [formData.state, provinceWardsMap])

    useEffect(() => {
        if (!formData.state) {
            setWardSearch("")
            setShowWardDropdown(false)
        }
    }, [formData.state])

    useEffect(() => {
        if (!provinceSearch.trim()) {
            setProvinceResults(allProvinces)
        } else {
            const term = provinceSearch.trim().toLowerCase()
            setProvinceResults(allProvinces.filter((province) => province.toLowerCase().includes(term)))
        }
    }, [provinceSearch, allProvinces])

    useEffect(() => {
        if (!wardSearch.trim()) {
            setWardResults(currentWards)
        } else {
            const term = wardSearch.trim().toLowerCase()
            setWardResults(currentWards.filter((ward) => ward.toLowerCase().includes(term)))
        }
    }, [wardSearch, currentWards])

    useEffect(() => {
        const handleClickOutside = (event) => {
            const target = event.target
            if (
                provinceSearchRef.current &&
                !provinceSearchRef.current.contains(target) &&
                provinceDropdownRef.current &&
                !provinceDropdownRef.current.contains(target)
            ) {
                setShowProvinceDropdown(false)
            }
            if (
                wardSearchRef.current &&
                !wardSearchRef.current.contains(target) &&
                wardDropdownRef.current &&
                !wardDropdownRef.current.contains(target)
            ) {
                setShowWardDropdown(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }))
    }

    const handleProvinceInputChange = (e) => {
        const value = e.target.value
        setProvinceSearch(value)
        setShowProvinceDropdown(true)
        setFormData((prev) => ({
            ...prev,
            state: value,
            city: prev.state === value ? prev.city : "",
        }))
        if (value.trim() === "") {
            setWardSearch("")
        }
    }

    const handleProvinceSelect = (province) => {
        setProvinceSearch(province)
        setShowProvinceDropdown(false)
        setFormData((prev) => ({
            ...prev,
            state: province,
            city: "",
        }))
        setWardSearch("")
    }

    const handleProvinceFocus = () => {
        setShowProvinceDropdown(true)
        if (allProvinces.length > 0) {
            setProvinceResults(allProvinces)
        }
    }

    const handleWardInputChange = (e) => {
        const value = e.target.value
        setWardSearch(value)
        setShowWardDropdown(true)
        setFormData((prev) => ({
            ...prev,
            city: value,
        }))
    }

    const handleWardSelect = (ward) => {
        setWardSearch(ward)
        setShowWardDropdown(false)
        setFormData((prev) => ({
            ...prev,
            city: ward,
        }))
    }

    const handleWardFocus = () => {
        if (!formData.state) {
            return
        }
        setWardResults(currentWards)
        setShowWardDropdown(true)
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
                country: "Vietnam",
                isDefault: false,
            })
            setCurrentWards([])
            setProvinceSearch("")
            setWardSearch("")
            setShowProvinceDropdown(false)
            setShowWardDropdown(false)

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
                    <Form.Label>Thành phố / Tỉnh</Form.Label>
                    <div className="address-search-container" ref={provinceSearchRef}>
                        <Form.Control
                            type="text"
                            name="state"
                            value={provinceSearch}
                            onChange={handleProvinceInputChange}
                            onFocus={handleProvinceFocus}
                            placeholder="Tìm kiếm thành phố / tỉnh"
                            autoComplete="address-level1"
                            required
                        />
                        {showProvinceDropdown && (
                            <div className="address-dropdown" ref={provinceDropdownRef}>
                                {loadingProvinces ? (
                                    <div className="address-dropdown-item disabled">Đang tải danh sách tỉnh/thành...</div>
                                ) : provinceResults.length > 0 ? (
                                    provinceResults.map((province) => (
                                        <div
                                            key={province}
                                            className="address-dropdown-item"
                                            onMouseDown={() => handleProvinceSelect(province)}
                                        >
                                            {province}
                                        </div>
                                    ))
                                ) : (
                                    <div className="address-dropdown-item disabled">Không tìm thấy tỉnh/thành phù hợp</div>
                                )}
                            </div>
                        )}
                    </div>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Xã / Phường</Form.Label>
                    <div className="address-search-container" ref={wardSearchRef}>
                        <Form.Control
                            type="text"
                            name="city"
                            value={wardSearch}
                            onChange={handleWardInputChange}
                            onFocus={handleWardFocus}
                            placeholder={formData.state ? "Tìm kiếm xã / phường" : "Chọn thành phố / tỉnh trước"}
                            autoComplete="address-level2"
                            required
                            disabled={!formData.state}
                        />
                        {showWardDropdown && formData.state && (
                            <div className="address-dropdown" ref={wardDropdownRef}>
                                {wardResults.length > 0 ? (
                                    wardResults.map((ward) => (
                                        <div
                                            key={ward}
                                            className="address-dropdown-item"
                                            onMouseDown={() => handleWardSelect(ward)}
                                        >
                                            {ward}
                                        </div>
                                    ))
                                ) : (
                                    <div className="address-dropdown-item disabled">Không tìm thấy xã/phường phù hợp</div>
                                )}
                            </div>
                        )}
                    </div>
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
