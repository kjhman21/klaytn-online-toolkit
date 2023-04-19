import { ReactElement, useEffect, useState } from 'react'
import styled from 'styled-components'
import Web3 from 'web3'
import Web3Modal from '@klaytn/web3modal'
import { KaikasWeb3Provider } from '@klaytn/kaikas-web3-provider'
import { KlipWeb3Provider } from '@klaytn/klip-web3-provider'
import _ from 'lodash'
import { isMobile } from 'react-device-detect'
import queryString from 'query-string'
// import Caver from 'caver-js'

import {
  Button,
  Container,
  Card,
  CardHeader,
  CardBody,
  View,
  Loading,
  LinkA,
  FormInput,
} from 'components'
import { IAssetData } from 'types'
import { WEB3MODAL } from 'consts'
import {
  apiGetAccountAssets,
  getChainData,
} from './helpers/utilities'
import {
  Header,
  AccountAssets,
  ModalResult,
  Modal,
} from './web3modalComponents'
import axios from 'axios'

const SLayout = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  text-align: center;
`

const SContent = styled.div`
  width: 100%;
  height: 100%;
  padding: 0 16px;
`

const FormGroup = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`

const SFormInput = styled(FormInput)`
  margin-bottom: 10px;
  width: 100%;
`
const NameConverter = styled.div`
  color: #ffffff;
  font-size: 16px;
  font-weight: 400;
  padding-bottom: 15px;
  min-width: 140px;
`

const SContainer = styled.div`
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-break: break-word;
`

const SLanding = styled(View)`
  height: 400px;
  align-items: center;
  justify-content: center;
`

const SModalContainer = styled.div`
  width: 100%;
  position: relative;
  word-wrap: break-word;
`

const SModalTitle = styled.div`
  margin: 1em 0;
  font-size: 20px;
  font-weight: 700;
`

const SModalParagraph = styled.p`
  margin-top: 30px;
  color: black;
  font-weight: 400;
`

const RoleTable = styled.div`
  padding: 20px 15px;
`
// @ts-ignore
const SBalances = styled(SLanding)`
  height: 100%;
  & h3 {
    padding-top: 30px;
  }
`

const STestButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  padding-bottom: 20px;
  gap: 8px;
`

const STestButton = styled(Button)`
  border-radius: 8px;
  height: 44px;
  width: 100%;
  max-width: 220px;
  font-size: 12px;
`

const Web3modalExample = (): ReactElement => {
  const [chainId, setChainId] = useState<number>(1)
  const [networkId, setNetworkId] = useState<number>(1)
  const [connected, setConnected] = useState<boolean>(false)
  const [address, setAddress] = useState('')
  const [fetching, setFetching] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [pendingRequest, setPendingRequest] = useState<boolean>(false)
  const [result, setResult] = useState<any | null>(null)
  const [assets, setAssets] = useState<IAssetData[]>()
  const [, setKip7ContractAddress] = useState('')
  const [web3modal, setWeb3modal] = useState<any>()
  const [web3, setWeb3] = useState<any>()
  const [userInfo, setUserInfo] = useState<any>({})
  const [roleClasses, setRoleClasses] = useState<Array<any>>([]);
  const href = window.location.href

  const avatar_url = process.env.REACT_APP_DISCORD_AVATAR_URL

  const getAccountAssets = async ({
    changedAddress,
    changedChainId,
  }: {
    changedAddress: string
    changedChainId: number
  }): Promise<void> => {
    try {
      setFetching(true)
      const assets = await apiGetAccountAssets(changedAddress, changedChainId)
      setAssets(assets)
      setFetching(false)
    } catch (err) {
      setFetching(false)
    }
  }

  useEffect(()=>{
    const qs = queryString.parse(window.location.search);
    if(qs.code) {
      axios.get(`${process.env.REACT_APP_BACKEND_API_URL}?code=${qs.code}`)
      .then(function (res) {
        setUserInfo(res.data)
      }).catch(function (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log("request failed")
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
        console.log(error.config);
      });
    }

    // fetch role table
    axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/class/klay`)
    .then(function (res) {
      setRoleClasses(res.data);
    }).catch(function (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log("request failed")
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
      console.log(error.config);
    });
  },[])

  useEffect(() => {
    setWeb3modal(
      new Web3Modal({
        network: getNetwork(),
        cacheProvider: false,
        providerOptions: getProviderOptions(),
      })
    )
  }, [networkId, chainId])

  const initWeb3 = (provider: any): any => {
    const web3: any = new Web3(provider)
    return web3
  }
  const onConnect = async (): Promise<void> => {
    const provider = await web3modal.connect()
    await provider.enable()
    const web3 = initWeb3(provider)
    const accounts = await web3.eth.getAccounts()
    const networkId = await web3.eth.net.getId()
    const chainId = await web3.eth.getChainId()
    setAddress(accounts[0])
    setNetworkId(networkId)
    setChainId(chainId)
    setConnected(true)
    setWeb3(web3)
    await subscribeProvider(provider, web3)
    await getAccountAssets({
      changedAddress: accounts[0],
      changedChainId: chainId,
    })
  }

  const getProviderOptions = (): any => {
    const providerOptions = {
      kaikas: {
        package: KaikasWeb3Provider,
      },
      klip: {
        package: KlipWeb3Provider,
        options: {
          bappName: 'web3Modal Example App',
          rpcUrl: 'https://public-node-api.klaytnapi.com/v1/cypress',
        },
      },
    }
    return providerOptions
  }

  const getNetwork = (): string => getChainData(chainId).network
  const subscribeProvider = async (provider: any, web3: any): Promise<void> => {
    if (!provider.on) {
      return
    }
    provider.on('close', () => resetApp())
    provider.on('accountsChanged', async (accounts: string[]) => {
      setAddress(accounts[0])
      const chainId = await web3.eth.getChainId()
      await getAccountAssets({
        changedAddress: accounts[0],
        changedChainId: chainId,
      })
    })
    provider.on('chainChanged', async (chainId: string) => {
      const networkId = await web3.eth.net.getId()
      const accounts = await web3.eth.getAccounts()
      setNetworkId(networkId)
      setChainId(_.toNumber(chainId))
      await getAccountAssets({
        changedAddress: accounts[0],
        changedChainId: _.toNumber(chainId),
      })
    })
    provider.on('networkChanged', async (networkId: number) => {
      const chainId = await web3.eth.getChainId()
      const accounts = await web3.eth.getAccounts()
      setNetworkId(networkId)
      setChainId(chainId)
      await getAccountAssets({
        changedAddress: accounts[0],
        changedChainId: chainId,
      })
    })
  }
  const toggleModal = (): void => setShowModal(!showModal)

  const resetApp = async (): Promise<void> => {
    web3modal.clearCachedProvider()
    //Initial state
    setAddress('')
    setAssets([])
    setChainId(1)
    setNetworkId(1)
    setConnected(false)
    setFetching(false)
    setWeb3(null)
    setShowModal(false)
    setPendingRequest(false)
    setResult(null)
    setKip7ContractAddress('')
  }

  const testSignPersonalMessage = async (): Promise<void> => {
    try {
      toggleModal()
      setPendingRequest(true)
      const ts = new Date().getTime();
      var message = ''
      if(!!assets && !!assets.length)
        message = `Address: ${address.toLowerCase()}\nDiscord ID: ${userInfo.id}\nDiscord Username: ${userInfo.username}\nTimestamp ${ts}`;

      const sig = await web3.eth.personal.sign(message, address, '')

      const res = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}`,{
        address,
        id: userInfo.id,
        username: userInfo.username,
        signature: sig,
        timestamp: ts,
      })
      console.log("result of", res)

      // verify signature
      const signer = await web3.eth.personal.ecRecover(message, sig)
      const verified = signer.toLowerCase() === address.toLowerCase()

      // verify signature with caver-js
      // const caver = new Caver('https://public-en-cypress.klaytn.net');
      // const sigdata = caver.utils.decodeSignature(sig);
      // const verifiedCaver = await caver.validator.validateSignedMessage(message, sigdata, address);

      // format displayed result
      const formattedResult = {
        action: WEB3MODAL.PERSONAL_SIGN,
        address,
        signer,
        verified,
        result: sig,
      }
      setPendingRequest(false)
      setResult(formattedResult || null)
    } catch (err) {
      setPendingRequest(false)
      setResult(null)
      console.log('error', err)
    }
  }

  const renderRoleTable = (): ReactElement[] => {
    var ret = [];
    for(var i = 0; i < roleClasses.length; i++) {
      var item = roleClasses[i];
      ret.push(
        <FormGroup key={item.limit}>
          <SFormInput
            placeholder={item.limit}
            onChange={():void=>{}}
            value={item.limit}
            readonly={true}
          />
          <NameConverter>{item.role}</NameConverter>
        </FormGroup>
      )
    }

    return ret;
  }

  return (
    <SLayout>
      <Container>
        <Header
          connected={connected}
          address={address}
          chainId={chainId}
          killSession={resetApp}
        />
        <SContent>
          {fetching ? (
            <View>
              <SContainer>
                <Loading />
              </SContainer>
            </View>
          ) : !!assets && !!assets.length ? (
            <>
              <SBalances>
                <h3>Balances</h3>
                <AccountAssets chainId={chainId} assets={assets} />{' '}
              </SBalances>
              <Card>
                <CardHeader>
                  <h2>{`KLAY Holder Verification`}</h2>
                  <h2>{`Your Discord Username: ${userInfo.username}`}</h2>
                  <h2>{`Your Wallet Address: ${address}`}</h2>
                  <h2><img src={`${avatar_url}/${userInfo.id}/${userInfo.avatar}`}/></h2>
                </CardHeader>
                <CardBody>
                  <View>
                    <STestButtonContainer>
                      <STestButton onClick={testSignPersonalMessage}>
                        Verify your KLAY to Discord!
                      </STestButton>
                    </STestButtonContainer>
                  </View>
                </CardBody>
              </Card>
            </>
          ) : (
            <SLanding>
              <h2>{`KLAY Holder Verification`}</h2>
              <h2>{`Your Discord ID: ${userInfo.username}`}</h2>
              <h2><img src={`${avatar_url}/${userInfo.id}/${userInfo.avatar}`}/></h2>
              {isMobile && (
                <View style={{ paddingBottom: 10 }}>
                  <LinkA link={`https://app.kaikas.io/u/${href}`}>
                    If using mobile device, please click here to open in-app
                    browser of Kaikas Mobile
                  </LinkA>
                </View>
              )}
              <Button onClick={onConnect}> Connect to Wallet</Button>
            </SLanding>
          )}
          <RoleTable>
            {renderRoleTable()}
          </RoleTable>
        </SContent>
      </Container>
      <Modal show={showModal} toggleModal={toggleModal}>
        {pendingRequest ? (
          <SModalContainer>
            <SModalTitle>{'Pending Call Request'}</SModalTitle>
            <SContainer>
              <Loading />
              <SModalParagraph>
                {'Approve or reject request using your wallet'}
              </SModalParagraph>
            </SContainer>
          </SModalContainer>
        ) : result ? (
          <SModalContainer>
            <SModalTitle>{'Call Request Approved'}</SModalTitle>
            <ModalResult>{result}</ModalResult>
          </SModalContainer>
        ) : (
          <SModalContainer>
            <SModalTitle>{'Call Request Rejected'}</SModalTitle>
            <ModalResult>{result}</ModalResult>
          </SModalContainer>
        )}
      </Modal>
    </SLayout>
  )
}

export default Web3modalExample
