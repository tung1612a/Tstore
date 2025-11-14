import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, clearCart } from '../../store/cartSlice';
import { FiMapPin, FiCreditCard, FiTruck, FiCheck, FiPlus, FiEdit3, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import './Checkout.css';
import { Toast, ToastContainer, Modal, Button } from 'react-bootstrap';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const allItems = useSelector((state) => state.cart.items);

  // Get selected items from navigation state, or use all items if not provided
  const selectedItemIds = location.state?.selectedItems || allItems.map((item) => item._id);
  const items = allItems.filter((item) => selectedItemIds.includes(item._id));
  const totalAmount = items.reduce((t, i) => t + i.quantity * i.price, 0);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    country: 'Vietnam',
    isDefault: false,
  });
  const [addressErrors, setAddressErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [editingAddress, setEditingAddress] = useState(null);

  const [provinceSearch, setProvinceSearch] = useState('');
  const [provinceResults, setProvinceResults] = useState([]);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [allProvinces, setAllProvinces] = useState([]);
  const provinceSearchRef = useRef(null);
  const provinceDropdownRef = useRef(null);

  const [wardSearch, setWardSearch] = useState('');
  const [wardResults, setWardResults] = useState([]);
  const [showWardDropdown, setShowWardDropdown] = useState(false);
  const [allWards, setAllWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const wardSearchRef = useRef(null);
  const wardDropdownRef = useRef(null);
  const [provinceWardsMap, setProvinceWardsMap] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastBg, setToastBg] = useState('success');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const showToastNotification = (message, bg = 'success') => {
    setToastMessage(message);
    setToastBg(bg);
    setShowToast(true);
  };

  useEffect(() => {
    const fetchAllAddresses = async () => {
      try {
        setLoadingProvinces(true);
        const response = await fetch('http://localhost:5000/api/vietnam-addresses');

        if (response.ok) {
          const data = await response.json();
          const addresses = data.data || [];

          const map = {};
          const provincesList = [];

          addresses.forEach((addr) => {
            map[addr.city] = addr.communes || [];
            provincesList.push(addr.city);
          });

          setProvinceWardsMap(map);
          setAllProvinces(provincesList.sort());
        } else {
          console.error('Error fetching addresses');
          setAllProvinces([]);
          setProvinceWardsMap({});
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        setAllProvinces([]);
        setProvinceWardsMap({});
      } finally {
        setLoadingProvinces(false);
      }
    };

    fetchAllAddresses();
  }, []);

  useEffect(() => {
    if (provinceSearch.trim() && allProvinces.length > 0) {
      const searchTerm = provinceSearch.trim().toLowerCase();
      const filtered = allProvinces.filter((city) => city.toLowerCase().includes(searchTerm));
      setProvinceResults(filtered);
      setShowProvinceDropdown(filtered.length > 0);
    } else {
      if (allProvinces.length > 0) {
        setProvinceResults(allProvinces);
        setShowProvinceDropdown(true);
      } else {
        setProvinceResults([]);
        setShowProvinceDropdown(false);
      }
    }
  }, [provinceSearch, allProvinces]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        provinceSearchRef.current &&
        !provinceSearchRef.current.contains(event.target) &&
        provinceDropdownRef.current &&
        !provinceDropdownRef.current.contains(event.target)
      ) {
        setShowProvinceDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProvinceSearchChange = (e) => {
    const value = e.target.value;
    setProvinceSearch(value);
    setNewAddress({ ...newAddress, state: value });

    if (value !== selectedProvince) {
      setSelectedProvince('');
      setWardSearch('');
      setNewAddress((prev) => ({ ...prev, city: '' }));
      setAllWards([]);
      setWardResults([]);
      setShowWardDropdown(false);
    }

    if (value.trim().length >= 2) {
    } else {
      setProvinceResults([]);
      setShowProvinceDropdown(false);
    }
  };

  const handleProvinceSelect = (province) => {
    setProvinceSearch(province);
    setNewAddress({ ...newAddress, state: province });
    setSelectedProvince(province);
    setShowProvinceDropdown(false);
    setProvinceResults([]);

    setWardSearch('');
    setNewAddress({ ...newAddress, city: '' });
    setWardResults([]);
    setShowWardDropdown(false);

    const wards = provinceWardsMap[province] || [];
    setAllWards(wards);
  };

  useEffect(() => {
    if (wardSearch.trim() && allWards.length > 0) {
      const searchTerm = wardSearch.trim().toLowerCase();
      const filtered = allWards.filter((ward) => ward.toLowerCase().includes(searchTerm));
      setWardResults(filtered);
      setShowWardDropdown(filtered.length > 0);
    } else {
      if (allWards.length > 0) {
        setWardResults(allWards);
        setShowWardDropdown(true);
      } else {
        setWardResults([]);
        setShowWardDropdown(false);
      }
    }
  }, [wardSearch, allWards]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wardSearchRef.current &&
        !wardSearchRef.current.contains(event.target) &&
        wardDropdownRef.current &&
        !wardDropdownRef.current.contains(event.target)
      ) {
        setShowWardDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleWardSearchChange = (e) => {
    const value = e.target.value;
    setWardSearch(value);
    setNewAddress({ ...newAddress, city: value });

    setWardResults([]);
    setShowWardDropdown(false);
  };

  const handleWardSelect = (ward) => {
    setWardSearch(ward);
    setNewAddress({ ...newAddress, city: ward });
    setShowWardDropdown(false);
    setWardResults([]);
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/address', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
        const defaultAddress = data.find((addr) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress._id);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const validateAddressForm = () => {
    const errors = {};

    if (!newAddress.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ và tên';
    } else if (newAddress.fullName.trim().length < 2) {
      errors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
    } else if (newAddress.fullName.trim().length > 50) {
      errors.fullName = 'Họ và tên không được vượt quá 50 ký tự';
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(newAddress.fullName.trim())) {
      errors.fullName = 'Họ và tên chỉ được chứa chữ cái và khoảng trắng';
    }

    if (!newAddress.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else {
      // Regex cho số điện thoại Việt Nam:
      // - Bắt đầu bằng 0 hoặc +84
      // - Tiếp theo là mã nhà mạng:
      //   * 32-39 (Viettel)
      //   * 56, 58, 59 (Viettel)
      //   * 70-79 (Mobifone, Viettel, Vinaphone)
      //   * 81-86, 88, 89 (Vinaphone) - loại trừ 87
      //   * 90-94, 96-99 (Mobifone, Viettel) - loại trừ 95
      // - Cuối cùng là 7 chữ số
      // Tổng cộng: 10 số (nếu bắt đầu bằng 0) hoặc 12 ký tự (nếu bắt đầu bằng +84)
      const cleanedPhone = newAddress.phone.trim().replace(/\s/g, '');

      // Kiểm tra format: chỉ cho phép 10 số (bắt đầu bằng 0)
      if (cleanedPhone.length !== 10) {
        errors.phone = 'Số điện thoại phải có đúng 10 chữ số';
      } else if (!cleanedPhone.startsWith('0')) {
        errors.phone = 'Số điện thoại phải bắt đầu bằng 0';
      } else {
        // Chuẩn hóa về định dạng 0xxx để kiểm tra mã nhà mạng
        const normalizedPhone = cleanedPhone;

        // Kiểm tra mã nhà mạng hợp lệ (2 chữ số đầu sau số 0)
        const networkCode = normalizedPhone.substring(1, 3);
        const validNetworkCodes = [
          '32',
          '33',
          '34',
          '35',
          '36',
          '37',
          '38',
          '39', // Viettel
          '56',
          '58',
          '59', // Viettel
          '70',
          '71',
          '72',
          '73',
          '74',
          '75',
          '76',
          '77',
          '78',
          '79', // Mobifone, Viettel, Vinaphone
          '81',
          '82',
          '83',
          '84',
          '85',
          '86',
          '88',
          '89', // Vinaphone (loại trừ 87)
          '90',
          '91',
          '92',
          '93',
          '94',
          '96',
          '97',
          '98',
          '99', // Mobifone, Viettel (loại trừ 95)
        ];

        if (!validNetworkCodes.includes(networkCode)) {
          errors.phone = 'Mã nhà mạng không hợp lệ. Vui lòng nhập số điện thoại với mã nhà mạng hợp lệ của Việt Nam';
        } else if (!/^\d{10}$/.test(normalizedPhone)) {
          errors.phone = 'Số điện thoại phải có đúng 10 chữ số (sau khi chuyển đổi)';
        }
      }
    }

    if (!newAddress.street.trim()) {
      errors.street = 'Vui lòng nhập địa chỉ cụ thể';
    } else if (newAddress.street.trim().length < 5) {
      errors.street = 'Địa chỉ phải có ít nhất 5 ký tự';
    } else if (newAddress.street.trim().length > 200) {
      errors.street = 'Địa chỉ không được vượt quá 200 ký tự';
    }

    const provinceValue = selectedProvince || newAddress.state.trim();
    if (!provinceValue) {
      errors.state = 'Vui lòng chọn tỉnh/thành phố';
    } else if (provinceValue.length > 50) {
      errors.state = 'Tên tỉnh/thành phố không được vượt quá 50 ký tự';
    }

    if (!newAddress.city.trim()) {
      errors.city = 'Vui lòng nhập xã/phường';
    } else if (newAddress.city.trim().length > 50) {
      errors.city = 'Tên xã/phường không được vượt quá 50 ký tự';
    }

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    if (!validateAddressForm()) {
      return;
    }

    if (editingAddress) {
      handleUpdateAddress(e);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newAddress,
          state: selectedProvince || newAddress.state.trim(),
          phone: newAddress.phone.trim().replace(/\s/g, ''),
        }),
      });

      if (response.ok) {
        const address = await response.json();
        setAddresses([...addresses, address]);
        setSelectedAddress(address._id);
        setShowAddressForm(false);
        setAddressErrors({});
        setProvinceSearch('');
        setProvinceResults([]);
        setShowProvinceDropdown(false);
        setWardSearch('');
        setWardResults([]);
        setShowWardDropdown(false);
        setAllWards([]);
        setSelectedProvince('');
        setNewAddress({
          fullName: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          country: 'Vietnam',
          isDefault: false,
        });
        showToastNotification('Thêm địa chỉ thành công!', 'success');
        setShowAddressForm(false);
        setNewAddress({
          fullName: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          country: 'Vietnam',
          isDefault: false,
        });
        setAddressErrors({});
        setProvinceSearch('');
        setWardSearch('');
        setSelectedProvince('');
        setAllWards([]);
        setProvinceResults([]);
        setWardResults([]);
        setShowProvinceDropdown(false);
        setShowWardDropdown(false);
        // Load lại danh sách địa chỉ
        fetchAddresses();
      } else {
        const errorData = await response.json();
        showToastNotification(errorData.message || 'Có lỗi xảy ra khi thêm địa chỉ', 'danger');
      }
    } catch (error) {
      console.error('Error creating address:', error);
      showToastNotification('Có lỗi xảy ra khi thêm địa chỉ', 'danger');
    }
  };

  const handleInputChange = (field, value) => {
    setNewAddress({ ...newAddress, [field]: value });
    if (addressErrors[field]) {
      setAddressErrors({ ...addressErrors, [field]: '' });
    }
  };

  const handlePhoneChange = (value) => {
    // Chỉ cho phép nhập số và giới hạn 10 số
    const numericValue = value.replace(/[^0-9]/g, '');
    // Giới hạn tối đa 10 số
    const limitedValue = numericValue.slice(0, 10);
    handleInputChange('phone', limitedValue);
  };

  const handleCloseAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressErrors({});
    setProvinceSearch('');
    setProvinceResults([]);
    setShowProvinceDropdown(false);
    setWardSearch('');
    setWardResults([]);
    setShowWardDropdown(false);
    setAllWards([]);
    setSelectedProvince('');
    setNewAddress({
      fullName: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      country: 'Vietnam',
      isDefault: false,
    });
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address._id);
    setNewAddress({
      fullName: address.fullName,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country || 'Vietnam',
      isDefault: address.isDefault || false,
    });
    setProvinceSearch(address.state || '');
    setSelectedProvince(address.state || '');
    setWardSearch(address.city || '');
    setProvinceResults([]);
    setShowProvinceDropdown(false);
    setWardResults([]);
    setShowWardDropdown(false);
    setShowAddressForm(true);
    setAddressErrors({});

    if (address.state) {
      const wards = provinceWardsMap[address.state] || [];
      setAllWards(wards);
    } else {
      setAllWards([]);
    }
  };

  const handleDeleteAddress = async (addressId, e) => {
    e.stopPropagation();
    // Mở modal confirm thay vì window.confirm
    setAddressToDelete(addressId);
    setShowDeleteModal(true);
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/address/${addressToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setAddresses(addresses.filter((addr) => addr._id !== addressToDelete));
        if (selectedAddress === addressToDelete) {
          setSelectedAddress(null);
        }
        showToastNotification('Xóa địa chỉ thành công!', 'success');
        fetchAddresses();
        setShowDeleteModal(false);
        setAddressToDelete(null);
      } else {
        const errorData = await response.json();
        showToastNotification(errorData.message || 'Có lỗi xảy ra khi xóa địa chỉ', 'danger');
        setShowDeleteModal(false);
        setAddressToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      showToastNotification('Có lỗi xảy ra khi xóa địa chỉ', 'danger');
      setShowDeleteModal(false);
      setAddressToDelete(null);
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateAddressForm()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/address/${editingAddress}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newAddress,
          state: selectedProvince || newAddress.state.trim(),
          phone: newAddress.phone.trim().replace(/\s/g, ''), // Clean phone number
        }),
      });

      if (response.ok) {
        const updatedAddress = await response.json();
        setAddresses(addresses.map((addr) => (addr._id === editingAddress ? updatedAddress : addr)));
        setEditingAddress(null);
        setShowAddressForm(false);
        setAddressErrors({});
        setProvinceSearch('');
        setProvinceResults([]);
        setShowProvinceDropdown(false);
        setWardSearch('');
        setWardResults([]);
        setShowWardDropdown(false);
        setAllWards([]);
        setSelectedProvince('');
        setNewAddress({
          fullName: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          country: 'Vietnam',
          isDefault: false,
        });
        // Nếu địa chỉ đang được chọn được cập nhật, giữ nguyên selectedAddress
        if (selectedAddress === editingAddress) {
          setSelectedAddress(editingAddress);
        }
        showToastNotification('Cập nhật địa chỉ thành công!', 'success');
        setShowAddressForm(false);
        setEditingAddress(null);
        setNewAddress({
          fullName: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          country: 'Vietnam',
          isDefault: false,
        });
        setAddressErrors({});
        setProvinceSearch('');
        setWardSearch('');
        setSelectedProvince('');
        setAllWards([]);
        setProvinceResults([]);
        setWardResults([]);
        setShowProvinceDropdown(false);
        setShowWardDropdown(false);
        // Load lại danh sách địa chỉ
        fetchAddresses();
      } else {
        const errorData = await response.json();
        showToastNotification(errorData.message || 'Có lỗi xảy ra khi cập nhật địa chỉ', 'danger');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      showToastNotification('Có lỗi xảy ra khi cập nhật địa chỉ', 'danger');
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      showToastNotification('Vui lòng chọn địa chỉ giao hàng', 'warning');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Tạo đơn hàng
      const orderData = {
        items: items.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
        addressId: selectedAddress,
        storeId: items[0]?.storeId || 'default',
        notes,
        paymentMethod,
      };

      const orderResponse = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (orderResponse.ok) {
        const orderData = await orderResponse.json();
        console.log('Order created:', orderData);
        
        // Xử lý response: có thể là single order hoặc multiple orders
        let orders = [];
        if (orderData.orders && Array.isArray(orderData.orders)) {
          // Nhiều đơn hàng (từ các seller khác nhau)
          orders = orderData.orders;
        } else if (orderData._id) {
          // Một đơn hàng duy nhất
          orders = [orderData];
        } else {
          alert('Đơn hàng đã được tạo nhưng không thể lấy mã đơn hàng. Vui lòng kiểm tra trong "Đơn hàng của tôi"');
          navigate('/orders');
          return;
        }

        // Lấy orderId đầu tiên để xử lý payment (hoặc có thể xử lý cho tất cả)
        const firstOrderId = orders[0]._id;
        
        // Chỉ tạo payment cho các phương thức khác COD
        if (paymentMethod !== 'cod') {
          // Tạo payment cho đơn hàng đầu tiên (hoặc có thể tạo cho tất cả)
          const paymentData = {
            orderId: firstOrderId,
            method: paymentMethod,
          };

          const paymentResponse = await fetch('http://localhost:5000/api/payments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(paymentData),
          });

          if (paymentResponse.ok) {
            const payment = await paymentResponse.json();

            // Xử lý thanh toán
            const processResponse = await fetch(`http://localhost:5000/api/payments/${payment._id}/process`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                status: 'paid',
                transactionId: `TXN_${Date.now()}`,
              }),
            });

            if (processResponse.ok) {
              try {
                await dispatch(clearCart()).unwrap();
              } catch (error) {
                console.error('Error clearing cart:', error);
              }
              // Nếu có nhiều đơn hàng, truyền tất cả orderIds
              const orderIds = orders.map(o => o._id);
              navigate('/thank-you', { state: { orderId: firstOrderId, orderIds: orderIds.length > 1 ? orderIds : undefined } });
            } else {
              // Nếu payment process thất bại, vẫn chuyển đến thank you page
              console.error('Payment process failed, but order was created');
              try {
                await dispatch(clearCart()).unwrap();
              } catch (error) {
                console.error('Error clearing cart:', error);
              }
              const orderIds = orders.map(o => o._id);
              navigate('/thank-you', { state: { orderId: firstOrderId, orderIds: orderIds.length > 1 ? orderIds : undefined } });
            }
          } else {
            // Nếu payment creation thất bại, vẫn chuyển đến thank you page
            console.error('Payment creation failed, but order was created');
            try {
              await dispatch(clearCart()).unwrap();
            } catch (error) {
              console.error('Error clearing cart:', error);
            }
            const orderIds = orders.map(o => o._id);
            navigate('/thank-you', { state: { orderId: firstOrderId, orderIds: orderIds.length > 1 ? orderIds : undefined } });
          }
        } else {
          // Đối với COD, chỉ cần clear cart và chuyển hướng
          try {
            await dispatch(clearCart()).unwrap();
          } catch (error) {
            console.error('Error clearing cart:', error);
          }
          // Nếu có nhiều đơn hàng, truyền tất cả orderIds
          const orderIds = orders.map(o => o._id);
          navigate('/thank-you', { state: { orderId: firstOrderId, orderIds: orderIds.length > 1 ? orderIds : undefined } });
        }
      } else {
        // Nếu tạo order thất bại
        const errorData = await orderResponse.json().catch(() => ({ message: 'Không thể tạo đơn hàng' }));
        alert(errorData.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      showToastNotification('Có lỗi xảy ra khi thanh toán', 'danger');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <div className="empty-cart-icon">
          <FiTruck size={80} />
        </div>
        <h2>Giỏ hàng trống</h2>
        <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
        <button onClick={() => navigate('/')} className="checkout-btn-primary">
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  const steps = [
    { id: 1, title: 'Địa chỉ giao hàng', icon: <FiMapPin /> },
    { id: 2, title: 'Phương thức thanh toán', icon: <FiCreditCard /> },
    { id: 3, title: 'Xác nhận đơn hàng', icon: <FiCheck /> },
  ];

  return (
    <div className="checkout">
      <div className="checkout-container">
        {/* Back Button */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => navigate('/cart')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'white',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              color: '#333',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#ee4d2d';
              e.target.style.color = '#ee4d2d';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e0e0e0';
              e.target.style.color = '#333';
            }}
          >
            <FiArrowLeft size={18} />
            Quay lại
          </button>
        </div>

        {/* Header */}
        <div className="checkout-header">
          <h1>Thanh toán</h1>
          <div className="checkout-steps">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`step ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''}`}
              >
                <div className="step-icon">{step.icon}</div>
                <span>{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-main">
            {/* Step 1: Địa chỉ giao hàng */}
            {currentStep === 1 && (
              <div className="checkout-section">
                <div className="section-header">
                  <h2>
                    <FiMapPin className="section-icon" />
                    Địa chỉ giao hàng
                  </h2>
                  {!editingAddress && (
                    <button
                      className="btn-add-address"
                      onClick={() => {
                        if (showAddressForm) {
                          // Nếu form đang mở, đóng và reset
                          handleCloseAddressForm();
                        } else {
                          // Mở form thêm mới
                          setEditingAddress(null);
                          setShowAddressForm(true);
                          setAddressErrors({});
                          setProvinceSearch('');
                          setProvinceResults([]);
                          setShowProvinceDropdown(false);
                          setWardSearch('');
                          setWardResults([]);
                          setShowWardDropdown(false);
                          setAllWards([]);
                          setSelectedProvince('');
                          setNewAddress({
                            fullName: '',
                            phone: '',
                            street: '',
                            city: '',
                            state: '',
                            country: 'Vietnam',
                            isDefault: false,
                          });
                        }
                      }}
                    >
                      <FiPlus size={16} />
                      Thêm địa chỉ mới
                    </button>
                  )}
                </div>

                {addresses.length > 0 ? (
                  <div className="address-grid">
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        className={`address-card ${selectedAddress === address._id ? 'selected' : ''}`}
                        onClick={(e) => {
                          // Chỉ chọn địa chỉ nếu không click vào button edit/delete
                          if (!e.target.closest('.address-actions')) {
                            setSelectedAddress(address._id);
                          }
                        }}
                      >
                        <div className="address-header">
                          <h4>{address.fullName}</h4>
                          {address.isDefault && <span className="default-badge">Mặc định</span>}
                        </div>
                        <div className="address-details">
                          <p>
                            <strong>SĐT:</strong> {address.phone}
                          </p>
                          <p>{address.street}</p>
                          <p>
                            {address.city}, {address.state}, {address.country}
                          </p>
                        </div>
                        <div className="address-actions">
                          <button
                            className="btn-edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(address);
                            }}
                          >
                            <FiEdit3 size={14} />
                          </button>
                          <button className="btn-delete" onClick={(e) => handleDeleteAddress(address._id, e)}>
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-address">
                    <p>Chưa có địa chỉ nào</p>
                  </div>
                )}

                {showAddressForm && (
                  <div className="address-form-container">
                    <form onSubmit={handleAddressSubmit} className="address-form">
                      <h3>{editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
                      <div className="form-row">
                        <div className="form-group">
                          <input
                            type="text"
                            placeholder="Họ và tên *"
                            value={newAddress.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            className={addressErrors.fullName ? 'checkout-input-error' : ''}
                            maxLength={50}
                          />
                          {addressErrors.fullName && (
                            <span className="checkout-error-message">{addressErrors.fullName}</span>
                          )}
                        </div>
                        <div className="form-group">
                          <input
                            type="tel"
                            placeholder="Số điện thoại *"
                            value={newAddress.phone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            maxLength={10}
                            onKeyPress={(e) => {
                              // Chỉ cho phép nhập số
                              if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            className={addressErrors.phone ? 'checkout-input-error' : ''}
                          />
                          {addressErrors.phone && <span className="checkout-error-message">{addressErrors.phone}</span>}
                        </div>
                      </div>
                      <div className="form-group">
                        <input
                          type="text"
                          placeholder="Địa chỉ cụ thể *"
                          value={newAddress.street}
                          onChange={(e) => handleInputChange('street', e.target.value)}
                          className={addressErrors.street ? 'checkout-input-error' : ''}
                          maxLength={200}
                        />
                        {addressErrors.street && <span className="checkout-error-message">{addressErrors.street}</span>}
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <div className="checkout-province-search-container" ref={wardSearchRef}>
                            <input
                              type="text"
                              placeholder="Tìm kiếm xã/phường *"
                              value={wardSearch}
                              onChange={handleWardSearchChange}
                              onFocus={() => {
                                setWardResults(allWards);
                                setShowWardDropdown(true);
                              }}
                              className={addressErrors.city ? 'checkout-input-error' : ''}
                              maxLength={50}
                            />
                            {showWardDropdown && (
                              <div className="checkout-province-dropdown" ref={wardDropdownRef}>
                                {wardResults.length > 0 ? (
                                  wardResults.map((ward, index) => (
                                    <div
                                      key={index}
                                      className="checkout-province-dropdown-item"
                                      onClick={() => handleWardSelect(ward)}
                                    >
                                      {ward}
                                    </div>
                                  ))
                                ) : (
                                  <div className="checkout-province-no-results">Không tìm thấy kết quả</div>
                                )}
                              </div>
                            )}
                          </div>
                          {addressErrors.city && <span className="checkout-error-message">{addressErrors.city}</span>}
                        </div>
                        <div className="form-group">
                          <div className="checkout-province-search-container" ref={provinceSearchRef}>
                            <input
                              type="text"
                              placeholder="Tìm kiếm tỉnh/thành phố *"
                              value={provinceSearch}
                              onChange={handleProvinceSearchChange}
                              onFocus={() => {
                                setProvinceResults(allProvinces);
                                setShowProvinceDropdown(true);
                              }}
                              className={addressErrors.state ? 'checkout-input-error' : ''}
                              maxLength={50}
                            />
                            {showProvinceDropdown && (
                              <div className="checkout-province-dropdown" ref={provinceDropdownRef}>
                                {loadingProvinces ? (
                                  <div className="checkout-province-loading">Đang tải...</div>
                                ) : provinceResults.length > 0 ? (
                                  provinceResults.map((province, index) => (
                                    <div
                                      key={index}
                                      className="checkout-province-dropdown-item"
                                      onClick={() => handleProvinceSelect(province)}
                                    >
                                      {province}
                                    </div>
                                  ))
                                ) : (
                                  <div className="checkout-province-no-results">Không tìm thấy kết quả</div>
                                )}
                              </div>
                            )}
                          </div>
                          {addressErrors.state && <span className="checkout-error-message">{addressErrors.state}</span>}
                        </div>
                      </div>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={newAddress.isDefault}
                          onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                        />
                        <span>Đặt làm địa chỉ mặc định</span>
                      </label>
                      <div className="checkout-form-actions">
                        <button type="button" className="checkout-btn-cancel" onClick={handleCloseAddressForm}>
                          Hủy
                        </button>
                        <button type="submit" className="checkout-btn-primary">
                          {editingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="checkout-step-actions">
                  <button
                    className="checkout-btn-primary"
                    onClick={() => setCurrentStep(2)}
                    disabled={!selectedAddress}
                  >
                    Tiếp tục
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Phương thức thanh toán */}
            {currentStep === 2 && (
              <div className="checkout-section">
                <div className="section-header">
                  <h2>
                    <FiCreditCard className="section-icon" />
                    Phương thức thanh toán
                  </h2>
                </div>

                <div className="payment-methods">
                  <div className="payment-method">
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label htmlFor="cod" className="payment-option">
                      <div className="payment-icon">💰</div>
                      <div className="payment-info">
                        <h4>Thanh toán khi nhận hàng (COD)</h4>
                        <p>Thanh toán bằng tiền mặt khi nhận hàng</p>
                      </div>
                    </label>
                  </div>

                  <div className="payment-method">
                    <input
                      type="radio"
                      id="bank_transfer"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label htmlFor="bank_transfer" className="payment-option">
                      <div className="payment-icon">🏦</div>
                      <div className="payment-info">
                        <h4>Chuyển khoản ngân hàng</h4>
                        <p>Chuyển khoản qua ngân hàng</p>
                      </div>
                    </label>
                  </div>

                  <div className="payment-method">
                    <input
                      type="radio"
                      id="momo"
                      name="paymentMethod"
                      value="momo"
                      checked={paymentMethod === 'momo'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label htmlFor="momo" className="payment-option">
                      <div className="payment-icon">💜</div>
                      <div className="payment-info">
                        <h4>Ví MoMo</h4>
                        <p>Thanh toán qua ví điện tử MoMo</p>
                      </div>
                    </label>
                  </div>

                  <div className="payment-method">
                    <input
                      type="radio"
                      id="zalopay"
                      name="paymentMethod"
                      value="zalopay"
                      checked={paymentMethod === 'zalopay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label htmlFor="zalopay" className="payment-option">
                      <div className="payment-icon">💙</div>
                      <div className="payment-info">
                        <h4>ZaloPay</h4>
                        <p>Thanh toán qua ZaloPay</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="notes-section">
                  <label htmlFor="notes">Ghi chú đơn hàng</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ghi chú cho người bán..."
                    rows="3"
                  />
                </div>

                <div className="checkout-step-actions">
                  <button className="checkout-btn-secondary" onClick={() => setCurrentStep(1)}>
                    Quay lại
                  </button>
                  <button className="checkout-btn-primary" onClick={() => setCurrentStep(3)}>
                    Tiếp tục
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Xác nhận đơn hàng */}
            {currentStep === 3 && (
              <div className="checkout-section">
                <div className="section-header">
                  <h2>
                    <FiCheck className="section-icon" />
                    Xác nhận đơn hàng
                  </h2>
                </div>

                <div className="order-summary">
                  <h3>Thông tin đơn hàng</h3>
                  <div className="summary-items">
                    {items.map((item) => (
                      <div key={item._id} className="summary-item">
                        <img src={item.image || item.imageURL || '/placeholder.jpg'} alt={item.title} />
                        <div className="item-details">
                          <h4>{item.title}</h4>
                          <p>Số lượng: {item.quantity}</p>
                          <p className="item-price">{item.price.toLocaleString()}đ</p>
                        </div>
                        <div className="item-total">{(item.price * item.quantity).toLocaleString()}đ</div>
                      </div>
                    ))}
                  </div>

                  <div className="summary-totals">
                    <div className="total-row">
                      <span>Tạm tính:</span>
                      <span>{totalAmount.toLocaleString()}đ</span>
                    </div>
                    <div className="total-row">
                      <span>Phí vận chuyển:</span>
                      <span className="free">Miễn phí</span>
                    </div>
                    <div className="total-row final">
                      <span>Tổng cộng:</span>
                      <span>{totalAmount.toLocaleString()}đ</span>
                    </div>
                  </div>
                </div>

                <div className="checkout-step-actions">
                  <button className="checkout-btn-secondary" onClick={() => setCurrentStep(2)}>
                    Quay lại
                  </button>
                  <button
                    className="checkout-btn-primary checkout-btn-checkout"
                    onClick={handleCheckout}
                    disabled={loading}
                  >
                    {loading ? 'Đang xử lý...' : 'Đặt hàng ngay'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="checkout-sidebar">
            <div className="sidebar-card">
              <h3>Tóm tắt đơn hàng</h3>
              <div className="sidebar-items">
                {items.map((item) => (
                  <div key={item._id} className="sidebar-item">
                    <img src={item.image || item.imageURL || '/placeholder.jpg'} alt={item.title} />
                    <div className="item-info">
                      <h5>{item.title}</h5>
                      <p>
                        {item.quantity} x {item.price.toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="sidebar-total">
                <div className="total-row">
                  <span>Tạm tính:</span>
                  <span>{totalAmount.toLocaleString()}đ</span>
                </div>
                <div className="total-row">
                  <span>Phí vận chuyển:</span>
                  <span className="free">Miễn phí</span>
                </div>
                <div className="total-row final">
                  <span>Tổng cộng:</span>
                  <span>{totalAmount.toLocaleString()}đ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-end" className="p-3">
        <Toast bg={toastBg} onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
          <Toast.Header>
            <strong className="me-auto">Thông báo</strong>
          </Toast.Header>
          <Toast.Body className={toastBg === 'danger' ? 'text-white' : 'text-white'}>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Modal xác nhận xóa địa chỉ */}
      <Modal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setAddressToDelete(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa địa chỉ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowDeleteModal(false);
              setAddressToDelete(null);
            }}
          >
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmDeleteAddress}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Checkout;
