import React from 'react';
import { Cascader } from 'antd';
import { pca } from 'area-data';

// 根据 area-data 的 pca 生成 Cascader options
const generateOptions = data => {
  const provinces = data['86'];
  return Object.entries(provinces).map(([provCode, provName]) => ({
    value: provCode,
    label: provName,
    children: data[provCode]
      ? Object.entries(data[provCode]).map(([cityCode, cityName]) => ({
          value: cityCode,
          label: cityName,
          children: data[cityCode]
            ? Object.entries(data[cityCode]).map(([areaCode, areaName]) => ({
                value: areaCode,
                label: areaName,
              }))
            : [],
        }))
      : [],
  }));
};

const options = generateOptions(pca);

const AddressSelector = ({ value, onChange, placeholder = '请选择地区' }) => (
  <Cascader
    options={options}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    allowClear
    changeOnSelect
  />
);

export default AddressSelector;