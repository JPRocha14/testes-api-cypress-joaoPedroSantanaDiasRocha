import { faker } from '@faker-js/faker';

describe('Consulta de Usuário', () => {
    var id;
    var token;
    var randomEmail = faker.internet.email();

    // hook para cadastrar usuário, logar com o usuário cadastrado 
    // e torná-lo admin para poder excluí-lo depois
    before(function () {
        cy.log('Cadastrando usuário');
        cy.cadastroRandom(randomEmail).then(function (idUser) {
            id = idUser;
            cy.log('Logando usuário');
            cy.loginUser(randomEmail).then(function (response) {
                token = response.body.accessToken;
                cy.log('Tornando usuário admin')
                cy.tornarAdm(token).then(function () {
                });
            });
        });
    });

    // hook para excluir usuário criado
    after(function () {
        cy.log('Deletando usuário')
        cy.deleteUsuario(id, token)
    })

    //cenários de listagem válidas de usuários sendo admin
    it('Deve permitir listar todos os usuários', function () {
        cy.request({
            method: 'GET',
            url: '/api/users',
            headers: {
                Authorization: 'Bearer ' + token
            }
        }).then(function (response) {
            expect(response.status).to.eq(200)
            expect(response.body).to.be.an('array')
            expect(response.body[0]).to.have.property('active');
            expect(response.body[0]).to.have.property('email');
            expect(response.body[0]).to.have.property('id');
            expect(response.body[0]).to.have.property('name');
            expect(response.body[0]).to.have.property('type');
        })
    })

    it('Deve permitir listar o usuário pelo id', function () {
        cy.request({
            method: 'GET',
            url: '/api/users/' + id,
            headers: {
                Authorization: 'Bearer ' + token
            }
        }).then(function (response) {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('object');
            expect(response.body.name).to.eq('João Pedro');
            expect(response.body.id).to.eq(id);
            expect(response.body.email).to.eq(randomEmail);
            expect(response.body).to.have.property('active');
            expect(response.body).to.have.property('type');
        });
    });

    it('Não deve permitir listar usuário por id inexistente', function () {
        cy.request({
            method: 'GET',
            url: '/api/users/' + 0,
            headers: {
                Authorization: 'Bearer ' + token
            }
        }).then(function (response) {
            expect(response.status).to.eq(200);
        });
    });
})