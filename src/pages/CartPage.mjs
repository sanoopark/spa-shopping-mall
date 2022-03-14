import Component from '../core/Component.mjs';
import { redirect } from '../router.mjs';
import { api } from '../apis/fetch.mjs';
import { localStorage } from '../apis/storage.mjs';
import { toLocaleString } from '../utils.mjs';
import { MESSAGE } from '../constants.mjs';

export default class CartPage extends Component {
  async mounted() {
    const productsCart = localStorage.get('products_cart');
    const cartItems = await this.fetchSomeProductDetail(productsCart);

    this.setState({ cartItems: [...this.state.cartItems, ...cartItems] });
    localStorage.set('cart_items', this.state.cartItems);
  }

  async fetchSomeProductDetail(productsCart) {
    return await Promise.all(
      productsCart.map(async ({ productId, optionId }, index) => {
        const response = await api.fetchProductDetail(productId);

        if (response.isError) {
          alert(MESSAGE.SERVER_ERROR);
          return;
        }

        const { optionName, optionPrice } = this.findOptionDetail(
          response,
          optionId
        );

        const {
          price: productPrice,
          imageUrl,
          name: productName
        } = response.data;

        return {
          ...productsCart[index],
          productName,
          imageUrl,
          productPrice,
          optionName,
          optionPrice
        };
      })
    );
  }

  findOptionDetail(response, optionId) {
    const { name, price } = response.data.productOptions.find(
      ({ id }) => id === Number(optionId)
    );
    return { optionName: name, optionPrice: price };
  }

  render() {
    this.target.innerHTML = `
      <div class="CartPage">
        <h1>장바구니</h1>
        <div class="Cart">
          <ul>
            ${this.state.cartItems
              ?.map(
                ({
                  imageUrl,
                  productName,
                  productPrice,
                  optionName,
                  optionPrice,
                  quantity
                }) => `
              <li class="Cart__item">
                <img src="${imageUrl}">
                <div class="Cart__itemDesription">
                  <div>${productName} ${optionName} ${productPrice} ${quantity}개</div>
                  <div>${toLocaleString(
                    (productPrice + optionPrice) * quantity
                  )}원</div>
                </div>
              </li>`
              )
              .join('')}
          </ul>
          <div class="Cart__totalPrice">
            총 상품가격 ${toLocaleString(this.calculateTotalPrice())}원
          </div>
          <button class="OrderButton">주문하기</button>
        </div>
      </div>
    `;
  }

  calculateTotalPrice() {
    const { cartItems } = this.state;

    return (
      cartItems
        ?.map(({ productPrice, optionPrice, quantity }) => {
          return (productPrice + optionPrice) * quantity;
        })
        .reduce((a, b) => a + b, 0) || 0
    );
  }

  setEvent() {
    this.addEvent({
      eventType: 'click',
      selector: '.OrderButton',
      callback: this.handleOrderClick
    });
  }

  handleOrderClick() {
    alert(MESSAGE.ORDER_COMPLETE);
    redirect('/web/');
    localStorage.remove('products_cart');
    localStorage.remove('cart_items');
  }
}
