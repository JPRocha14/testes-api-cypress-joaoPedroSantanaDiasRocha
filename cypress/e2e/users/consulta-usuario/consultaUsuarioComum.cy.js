import { faker } from '@faker-js/faker';

describe('Consulta de Usuário Não Admin', () => {
    var id;
    var token;
    var randomEmail = faker.internet.email();
    var randomNumber = faker.number.bigInt({ min: 1000000n });

    // hook para cadastrar usuário e logar com o usuário cadastrado
    before(function () {
        cy.log('Cadastrando usuário');
        cy.cadastroRandom(randomEmail).then(function (idUser) {
            id = idUser;
            cy.log('Logando usuário');
            cy.loginUser(randomEmail).then(function (response) {
                token = response.body.accessToken;
            });
        });
    });

    after(function () {
        cy.log('Inativando usuário')
        cy.inativarUser(token);
    });

    // cenários de listagens não válidas por um usuário comum
    describe('Listagem inválida pelo usuário comum', function () {
        it('Não deve permitir listar todos os usuários', function () {
            cy.request({
                method: 'GET',
                url: '/api/users',
                headers: {
                    Authorization: 'Bearer ' + token
                },
                failOnStatusCode: false
            }).then(function (response) {
                expect(response.status).to.eq(403);
                cy.fixture('./fixture-consulta/listagemInvalida.json').then(function (listagemInvalida) {
                    expect(response.body).to.deep.eq(listagemInvalida);
                });
                expect(response.body).to.be.an('object');
            });
        });

        it('Não deve permitir listar outros usuários pelo id', function () {
            cy.request({
                method: 'GET',
                url: '/api/users/' + randomNumber,
                headers: {
                    Authorization: 'Bearer ' + token
                },
                failOnStatusCode: false
            }).then(function (response) {
                expect(response.status).to.eq(403)
                cy.fixture('./fixture-consulta/listagemInvalida.json').then(function (listagemInvalida) {
                    expect(response.body).to.deep.eq(listagemInvalida);
                });
                expect(response.body).to.be.an('object');
            });
        });
    });

    // cenário de listagem válida por um usuário comum
    describe('Listagem válida pelo usuário comum', function () {
        it('Deve permitir listar seu próprio usuário pelo id', function () {
            cy.request({
                method: 'GET',
                url: '/api/users/' + id,
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }).then(function (response) {
                expect(response.status).to.eq(200);
                expect(response.body.name).to.eq('João Pedro');
                expect(response.body).to.be.an('object');
                expect(response.body).to.have.property('id');
                expect(response.body).to.have.property('name');
                expect(response.body).to.have.property('email');
            });
        });
    });
})