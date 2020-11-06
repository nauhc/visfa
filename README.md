[![MIT License][license-shield]][license-url]

<br />
<p align="center">
  <h3 align="center">ViSFA </h3>
  <h4 align="center"> Visual Summary of Value-level Feature Attribution in Prediction Classes with Recurrent Neural Networks </h4>
</p>

<!-- ## Table of Contents

- [About the Project](#about-the-project)
  - [Built With](#built-with)
- [Demo](#demo)
- [License](#license)
- [Contact](#contact) -->

## About The Project

### Built With

- [React](https://reactjs.org/)
- [deck.gl](https://deck.gl/)
- [Recharts](https://recharts.org/en-US/)
- [PyTorch](https://pytorch.org/)

### Demo

ViSFA helps to understand how recurrent neural networks produce final predictions. It's an interactive system that visually summarizes feature attribution over time for different feature values.

<!-- In the following example, we train a biLSTM model that uses electronic health records to predict patients' mortality. The following demo visualizes the health records of two patients (one <font color = '#8884d8'>dead</font> and one <font color='#82ca9d'>alive</font>). -->

![Product Name Screen Shot][product-screenshot]

For feature attribution, I trained this [biLSTM model with the attention mechanism](https://github.com/nauhc/bilstm-many-to-one).

<!-- Here, perturbing the patient's "joint fluid" values at the last three time-steps alters the mortality prediction result from the dead to alive! -->

Cite our paper [ViSFA](https://arxiv.org/pdf/2001.08379.pdf)

```
@misc{wang2020visual,
      title={Visual Summary of Value-level Feature Attribution in Prediction Classes with Recurrent Neural Networks},
      author={Chuan Wang and Xumeng Wang and Kwan-Liu Ma},
      year={2020},
      eprint={2001.08379},
      archivePrefix={arXiv},
      primaryClass={cs.LG}
}
}
```

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Project Link: [https://github.com/nauhc/hyppersteer](https://github.com/nauhc/hyppersteer)

<!-- [contributors-shield]: https://img.shields.io/github/contributors/othneildrew/Best-README-Template.svg?style=flat-square
[contributors-url]: https://github.com/nauhc/hyppersteer/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/othneildrew/Best-README-Template.svg?style=flat-square
[forks-url]: https://github.com/othneildrew/Best-README-Template/network/members
[stars-shield]: https://img.shields.io/github/stars/othneildrew/Best-README-Template.svg?style=flat-square
[stars-url]: https://github.com/othneildrew/Best-README-Template/stargazers
[issues-shield]: https://img.shields.io/github/issues/othneildrew/Best-README-Template.svg?style=flat-square
[issues-url]: https://github.com/othneildrew/Best-README-Template/issues -->

[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=flat-square
[license-url]: https://github.com/othneildrew/Best-README-Template/blob/master/LICENSE.txt

<!-- [linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=flat-square&logo=linkedin&colorB=555 -->
<!-- [linkedin-url]: https://linkedin.com/in/othneildrew -->

[product-screenshot]: images/visfa.gif
