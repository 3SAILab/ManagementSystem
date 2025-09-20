// AddressSelector.jsx
import React, { useState, useEffect } from 'react';
import allCity from 'china-area-data';

const AddressSelector = ({ value, onChange }) => {
  const [province, setProvince] = useState(value?.[0] || '');
  const [city, setCity] = useState(value?.[1] || '');
  const [district, setDistrict] = useState(value?.[2] || '');

  // 根据 data.json 结构获取省份、城市、区县数据
  const provinceData = allCity['86'] || {};
  const provinceOptions = Object.entries(provinceData).map(([code, name]) => ({ value: code, label: name }));

  const cityData = province ? allCity[province] || {} : {};
  const cityOptions = Object.entries(cityData).map(([code, name]) => ({ value: code, label: name }));

  const districtData = city ? allCity[city] || {} : {};
  const districtOptions = Object.entries(districtData).map(([code, name]) => ({ value: code, label: name }));

  // 处理省份选择
  const handleProvinceChange = (e) => {
    const selected = e.target.value;
    setProvince(selected);
    setCity('');
    setDistrict('');
    onChange([selected, '', '']);
  };

  // 处理城市选择
  const handleCityChange = (e) => {
    const selected = e.target.value;
    setCity(selected);
    setDistrict('');
    onChange([province, selected, '']);
  };

  // 处理区县选择
  const handleDistrictChange = (e) => {
    const selected = e.target.value;
    setDistrict(selected);
    onChange([province, city, selected]);
  };

  // 在编辑时同步状态
  useEffect(() => {
    if (value && Array.isArray(value)) {
      setProvince(value[0] || '');
      setCity(value[1] || '');
      setDistrict(value[2] || '');
    }
  }, [value]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
      {/* 省份 */}
      <select
        id="province-select"
        name="province"
        value={province}
        onChange={handleProvinceChange}
        className="form-select"
      >
        <option value="">选择省份</option>
        {provinceOptions.map(p => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>

      {/* 城市 */}
      <select
        id="city-select"
        name="city"
        value={city}
        onChange={handleCityChange}
        disabled={!province}
        className="form-select"
      >
        <option value="">选择城市</option>
        {cityOptions.map(c => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      {/* 区/县 */}
      <select
        id="district-select"
        name="district"
        value={district}
        onChange={handleDistrictChange}
        disabled={!city}
        className="form-select"
      >
        <option value="">选择区/县</option>
        {districtOptions.map(d => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AddressSelector;