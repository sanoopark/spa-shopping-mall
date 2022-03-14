import Component from '../core/Component.mjs';
import { redirect } from '../router.mjs';
import { api } from '../apis/fetch.mjs';
import { localStorage } from '../apis/storage.mjs';
import { toLocaleString } from '../utils.mjs';
import { MESSAGE } from '../constants.mjs';

export default class ProductDetailPage extends Component {
  async mounted() {
    const productId = this.state.params.id;
    const response = await api.fetchProductDetail(productId);

    if (response.isError) {
      alert(MESSAGE.SERVER_ERROR);
      return;
    }

    this.setState({
      productDetail: response.data
    });
  }

  render() {
    const { productDetail } = this.state;
    const { selectedOptions } = this.state;
    const {
      name: productName,
      price: productPrice,
      imageUrl,
      productOptions
    } = productDetail;

    this.target.innerHTML = `
     <div class="ProductDetailPage">
        <h1>커피잔 상품 정보</h1>
        <div class="ProductDetail">
          <img src="${imageUrl}">
          <div class="ProductDetail__info">
            <h2>${productName}</h2>
            <div class="ProductDetail__price">${toLocaleString(
              productPrice
            )}원~</div>
            <select class="ProductDetail__select">
              <option>선택하세요.</option>
              ${this.optionGenerator(productName, productOptions)}
            </select>
            <div class="ProductDetail__selectedOptions">
              <h3>선택된 상품</h3>
              <ul>
                ${this.selectedListGenerator(
                  productName,
                  productPrice,
                  selectedOptions
                )}
              </ul>
              <div class="ProductDetail__totalPrice">${toLocaleString(
                this.calculateTotalPrice(productPrice)
              )}원</div>
              <button class="OrderButton">주문하기</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  optionGenerator(productName, productOptions) {
    return productOptions
      ?.map(({ id: optionId, name: optionName, price: optionPrice, stock }) => {
        if (stock === 0) {
          return `<option disabled>(품절) ${productName} ${optionName}</option>`;
        }

        if (optionPrice === 0) {
          return `<option data-id="${optionId}" data-name="${optionName}" data-price="${optionPrice}">${productName} ${optionName}</option>`;
        }

        if (optionPrice > 0) {
          return `<option data-id="${optionId}" data-name="${optionName}" data-price="${optionPrice}">${productName} ${optionName}(+${toLocaleString(
            optionPrice
          )})</option>`;
        }
      })
      .join('');
  }

  selectedListGenerator(productName, productPrice, selectedOptions) {
    return Object.entries(selectedOptions)
      .map(
        ([optionId, { name: optionName, price: optionPrice }]) => `
        <li>
          ${productName} ${optionName} ${toLocaleString(
          productPrice + Number(optionPrice)
        )}원
          <div>
            <input data-id="${optionId}" type="number" 
            value="${selectedOptions[optionId].quantity}">개</div>
        </li>
    `
      )
      .join('');
  }

  calculateTotalPrice(productPrice) {
    const { selectedOptions } = this.state;

    return (
      Object.values(selectedOptions)
        .map(({ price: optionPrice, quantity }) => {
          return (productPrice + Number(optionPrice)) * quantity;
        })
        .reduce((a, b) => a + b, 0) || 0
    );
  }

  setEvent() {
    this.addEvent({
      eventType: 'change',
      selector: '.ProductDetail__select',
      callback: this.handleSelectChange
    });

    this.addEvent({
      eventType: 'change',
      selector: '.ProductDetail__selectedOptions',
      callback: this.handleInputChange
    });

    this.addEvent({
      eventType: 'click',
      selector: '.OrderButton',
      callback: this.handleOrderClick
    });
  }

  handleSelectChange({ target }) {
    const $option = target.options[target.selectedIndex];
    const {
      name: optionName,
      price: optionPrice,
      id: optionId
    } = $option.dataset;

    const isAlreadySelected =
      this.state.selectedOptions.hasOwnProperty(optionId);

    if (isAlreadySelected) return;

    this.setState({
      selectedOptions: {
        ...this.state.selectedOptions,
        [optionId]: {
          name: optionName,
          price: optionPrice,
          quantity: 1
        }
      }
    });
  }

  handleInputChange({ target }) {
    const optionId = target.dataset.id;
    const quantity = target.value;

    this.setState({
      selectedOptions: {
        ...this.state.selectedOptions,
        [optionId]: {
          ...this.state.selectedOptions[optionId],
          quantity: quantity
        }
      }
    });
  }

  handleOrderClick() {
    const { id: productId } = this.state.productDetail;
    const { selectedOptions } = this.state;

    const productsCart = Object.entries(selectedOptions).map(
      ([optionId, { quantity }]) => {
        return {
          productId,
          optionId,
          quantity
        };
      }
    );

    const previousCart = localStorage.get('products_cart');

    if (previousCart) {
      localStorage.set('products_cart', [...previousCart, ...productsCart]);
    } else {
      localStorage.set('products_cart', productsCart);
    }

    redirect('/web/cart');
  }
}
