import React, { useEffect, useRef, useContext, useState } from 'react';
import "../../stylesheets/styles.css";
import BaseImage from '../../components/BaseImage';
import { UserContext } from '../../components/BaseShot';
import { getAudioPath, prePathUrl, setPrimaryAudio, setRepeatAudio, setRepeatType, startRepeatAudio, stopRepeatAudio } from "../../components/CommonFunctions";

import { SIGNALLIST } from "../../components/CommonVarariant"


let answerList = []

let optionList = [0, 1]
let optionType = 0;

let correctNum = 0
let doneCount = 0



const posInfoList = [
    { f: '1', wN: '1', x: 4 },
    { f: '1', wN: '2', x: 29 },
    { f: '1', wN: '3', x: 54 },
    { f: '1', wN: '4', x: 79 },

    { f: '2', wN: '1', x: 12 },
    { f: '2', wN: '2', x: 42 },
    { f: '2', wN: '3', x: 72 },
]


let stepCount = 0;
let optionGroup = [4, 3]


const iconMovePosList = [
    [4, 29, 54, 78.5],
    [12, 42, 72],
]

let timerList = []

let disableState = false;

let isFirstPartShow = true;

let thirdRandom = []
const OptionScene = React.forwardRef(({ nextFunc, transSignaler, _geo, continueSecondPart }, ref) => {

    const optionLength = posInfoList.length

    const audioList = useContext(UserContext)
    const parentObject = useRef();
    const thirdPartRef = useRef()
    const thirdIconRef = useRef()

    const textRefList = Array.from({ length: optionLength }, ref => useRef())
    const clickRefList = Array.from({ length: optionLength }, ref => useRef())
    const itemRefList = Array.from({ length: optionLength }, ref => useRef())
    const textClickRef = Array.from({ length: optionLength }, ref => useRef())

    const [isShowLastPart, setShowLastPart] = useState(false)

    if (thirdRandom.length == 0)
        while (thirdRandom.length != 2) {
            let randomNumber = Math.floor(Math.random() * 2);
            if (!thirdRandom.includes(randomNumber)) {
                thirdRandom.push(randomNumber)
            }
        }

    useEffect(() => {
        setPositionFomart()

        return () => {
            answerList = []
            optionType = 0;
            stepCount = 0;

            thirdRandom = []


        }
    }, [])

    React.useImperativeHandle(ref, () => ({
        continueGame: () => {
            //continue games...

            audioList.bodyAudio1.src = getAudioPath('option/' + (stepCount + 2) + '/q')
            audioList.bodyAudio2.src = getAudioPath('option/' + (stepCount + 2) + '/1')

            setPrimaryAudio(audioList.bodyAudio2)
            setRepeatAudio(audioList.commonAudio1)
            setRepeatType(1)

            parentObject.current.style.pointerEvents = ''
            parentObject.current.className = 'appear'


            timerList[0] = setTimeout(() => {
                audioList.bodyAudio1.play();
                timerList[1] = setTimeout(() => {
                    audioList.bodyAudio2.play();
                    startRepeatAudio()
                }, audioList.bodyAudio1.duration * 1000 + 300);
            }, 2000);
        },
        startGame: () => {

            audioList.bodyAudio1.src = getAudioPath('option/' + (stepCount + 1) + '/q')
            audioList.bodyAudio2.src = getAudioPath('option/' + (stepCount + 1) + '/1')


            setPrimaryAudio(audioList.bodyAudio2)
            setRepeatAudio(audioList.commonAudio1)
            setRepeatType(1)

            timerList[0] = setTimeout(() => {
                audioList.bodyAudio1.play();
                timerList[1] = setTimeout(() => {
                    audioList.bodyAudio2.play();
                    timerList[2] = setTimeout(() => {
                        startRepeatAudio()
                        audioList.commonAudio1.play();
                    }, audioList.bodyAudio2.duration * 1000 + 300);


                }, audioList.bodyAudio1.duration * 1000 + 600);
            }, 1500);
        }
    }))



    const clickFunc = (num) => {
        stopRepeatAudio();

        audioList.bodyAudio1.pause()
        audioList.bodyAudio2.pause()
        audioList.buzzAudio.pause();


        timerList.map(timer => clearTimeout(timer))

        clickRefList[num].current.style.transition = '0.5s'
        clickRefList[num].current.style.transform = 'scale(0.7)'

        setTimeout(() => {
            clickRefList[num].current.style.transform = 'scale(1)'
            setTimeout(() => {
                judgeFunc(num)
            }, 150);
        }, 100);

        setShowLastPart(true)
    }

    const setPositionFomart = () => {

        for (let i = 0; i < answerList.length; i++) {
            clickRefList[doneCount + i].current.style.left =
                posInfoList[answerList[i]].x + '%'
            clickRefList[doneCount + i].current.style.transition = '0s'
        }
    }

    const goNextStep = () => {

        doneCount += optionGroup[stepCount]
        transSignaler(SIGNALLIST.increaseMark)

        setTimeout(() => {


            if (stepCount < optionGroup.length - 1) {

                correctNum = 0;
                stepCount++;

                let waitTime = 500


                audioList.bodyAudio1.src = getAudioPath('option/' + (stepCount + 1) + '/q')
                audioList.bodyAudio2.src = getAudioPath('option/' + (stepCount + 1) + '/1')

                disableState = false
                parentObject.current.className = 'disapear'

                setTimeout(() => {

                    optionType = optionList[stepCount]

                    getRandomAnswerList()

                    itemRefList.map((value, index) => {
                        if (index > doneCount - 1) {
                            if (stepCount != optionGroup.length - 1 && index < doneCount + optionGroup[stepCount]) {
                                if (index == doneCount)
                                    value.current.className = 'showObject'
                                clickRefList[index].current.className = 'showObject'
                            }
                            if (stepCount == optionGroup.length - 1) {
                                if (index == doneCount)
                                    value.current.className = 'showObject'
                                clickRefList[index].current.className = 'showObject'
                            }
                        }
                        else {
                            value.current.className = 'hideObject'
                            clickRefList[index].current.className = 'hideObject'
                        }
                    })

                    setPositionFomart();

                    setPrimaryAudio(audioList.bodyAudio2)
                    setRepeatAudio(audioList.commonAudio1)
                    setRepeatType(1)

                    if (!disableState) {
                        parentObject.current.className = 'appear'
                        parentObject.current.style.pointerEvents = ''
                        timerList[0] = setTimeout(() => {
                            audioList.bodyAudio1.play();
                            timerList[1] = setTimeout(() => {
                                audioList.bodyAudio2.play();
                                timerList[2] = setTimeout(() => {
                                    startRepeatAudio()
                                    audioList.commonAudio1.play()
                                }, audioList.bodyAudio2.duration * 1000);

                            }, audioList.bodyAudio1.duration * 1000 + 300);
                        }, 2000);
                    }
                }, waitTime);
            }

            else {

                disableState = true
                setTimeout(() => {
                    parentObject.current.className = 'disapear'
                    continueSecondPart()
                }, 2000);

                setTimeout(() => {
                    itemRefList.map((value, index) => {
                        value.current.className = 'hideObject'
                        clickRefList[index].current.className = 'hideObject'
                    })
                    thirdPartRef.current.className = 'appear'
                    parentObject.current.style.pointerEvents = ''
                }, 3000);
            }
        }, 1000);
    }

    const getRandomAnswerList = () => {

        answerList = []
        let needLength = optionGroup[stepCount];

        const defaultRandomList = [
            [
                [1, 0]
            ],
            [
                [2, 0, 1], [1, 2, 0]
            ],
            [
                [3, 2, 1, 0], [3, 2, 0, 1],
                [1, 0, 3, 2], [1, 0, 3, 2],
                [2, 3, 1, 0], [2, 3, 0, 1]
            ]
        ]

        let currentNum = needLength - 2

        let randomNumber = Math.floor(Math.random() * defaultRandomList[currentNum].length);

        defaultRandomList[currentNum][randomNumber].map(value => {
            answerList.push(value + doneCount)
        })
    }

    if (answerList.length == 0)
        getRandomAnswerList()

    const judgeFunc = (num) => {
        if (num == doneCount + correctNum) {

            parentObject.current.style.pointerEvents = 'none'
            clickRefList[num].current.style.zIndex = (1000 + doneCount)

            clickRefList[num].current.style.pointerEvents = 'none'
            clickRefList[num].current.style.transition = '0.8s'

            clickRefList[num].current.style.left = iconMovePosList[optionType][correctNum] + '%'
            clickRefList[num].current.style.top = '47%'

            correctNum++
            audioList.tingAudio.play();

            if (correctNum == answerList.length) {
                setTimeout(() => {
                    goNextStep()
                }, 1000);

            }

            else {
                audioList.bodyAudio2.src = getAudioPath('option/' + (stepCount + 1) + '/' + (correctNum + 1))

                transSignaler(SIGNALLIST.loadSecondPart)

                timerList[0] = setTimeout(() => {
                    itemRefList[doneCount + correctNum].current.className = 'appear'
                    parentObject.current.style.pointerEvents = ''

                    audioList.bodyAudio2.play();
                    startRepeatAudio()
                }, 2000);
            }
        }
        else {
            audioList.buzzAudio.currentTime = 0;
            audioList.buzzAudio.play();

            timerList[1] = setTimeout(() => {
                audioList.bodyAudio2.currentTime = 0
                audioList.bodyAudio2.play();
                startRepeatAudio()
            }, 1000);
        }
    }

    const textClickFunc = (index) => {

        stopRepeatAudio();

        audioList.bodyAudio1.pause()
        audioList.bodyAudio2.pause()


        timerList.map(timer => clearTimeout(timer))

        if (index == 0) {
            thirdPartRef.current.style.pointerEvents = 'none'
            thirdIconRef.current.setStyle(
                {
                    transition: '0.8s',
                    left: [25, 60][thirdRandom[index]] + '%',
                    top: 47 + '%'
                }
            )

            audioList.tingAudio.play();

            transSignaler(SIGNALLIST.increaseMark)

            setTimeout(() => {
                nextFunc()
            }, 3000);
        }
        else {
            audioList.buzzAudio.currentTime = 0;
            audioList.buzzAudio.play();

            timerList[1] = setTimeout(() => {
                audioList.bodyAudio2.currentTime = 0
                audioList.bodyAudio2.play();
                startRepeatAudio()
            }, 1000);
        }



    }

    return (
        <div ref={parentObject}
            style={{
                position: "fixed", width: _geo.width + "px"
                , height: _geo.height + "px",
                left: _geo.left + 'px',
                top: _geo.top + 'px',
            }}
        >
            {
                posInfoList.map((value, index) =>
                    (isShowLastPart || index < optionGroup[0]) &&


                    <div
                        key={index}
                        ref={itemRefList[index]}
                        style={{
                            position: "absolute",
                            width: '100%'
                            , height: '100%',
                            left: 0 + '%',
                            top: '0%',
                        }}
                        className={index == 0 ? '' : 'hideObject'}
                    >

                        <BaseImage
                            scale={0.22}
                            posInfo={{
                                l: (posInfoList[index].x - 2.5) / 100,
                                b: 0.105
                            }}
                            ref={textRefList[index]}

                            url={"option/" + value.f + "/" + value.wN + "a.png"}
                        />
                        <div
                            key={index}
                            ref={textClickRef[index]}
                            onClick={() => { textClickFunc(index) }}
                            style={{
                                position: "absolute",
                                width: '20%'
                                , height: '15%',
                                left: (posInfoList[index].x - 1.5) + '%',
                                bottom: '12%',
                                borderRadius: '30%',
                                cursor: 'pointer',
                                zIndex: 100,
                                opacity: 0.3
                            }}
                            className={'hideObject'}
                        >
                        </div>
                    </div>

                )
            }
            {
                isShowLastPart &&
                <div
                    ref={thirdPartRef}
                    className='hideObject'
                    style={{
                        position: "absolute",
                        width: '100%'
                        , height: '100%',
                        left: 0 + '%',
                        top: '0%',
                    }}
                >


                    {
                        [25, 60].map((value, index) => <div
                            key={index}
                            onClick={() => { textClickFunc(thirdRandom[index]) }}
                            style={{
                                position: "absolute",
                                width: '20%'
                                , height: '15%',
                                left: (value - 1.5) + '%',
                                bottom: '12%',
                                borderRadius: '40%',
                                cursor: 'pointer',
                                zIndex: 100000,
                            }}
                        >
                            <BaseImage
                                posInfo={{
                                    l: 0,
                                    b: 0
                                }}

                                url={"option/3/" + (thirdRandom[index] + 1) + "a.png"}
                            />
                        </div>
                        )
                    }

                    <BaseImage
                        ref={thirdIconRef}
                        scale={0.17}
                        posInfo={{ l: 0.42, t: 0.15 }}
                        style={{
                            zIndex: 101
                        }}
                        url={"option/3/1.png"}
                    />
                </div>
            }
            {
                posInfoList.map((value, index) =>
                    (isShowLastPart || index < optionGroup[0]) &&
                    <div
                        className={index > optionGroup[0] - 1 ? 'hideObject' : ''}
                        ref={clickRefList[index]}
                        onClick={() => { clickFunc(index) }}
                        style={{
                            position: 'absolute',
                            top: 30 + '%',
                            width: 17 + '%',
                            height: 30 + '%',
                            borderRadius: '50%',
                            left: posInfoList[index].x + 0 + '%',
                            top: '16%',
                            cursor: 'pointer',
                        }}>
                        <BaseImage
                            posInfo={{ l: 0, t: 0 }}
                            url={"option/" + value.f + "/" + value.wN + ".png"}
                        />
                    </div>
                )
            }

        </div >
    );
});

export { OptionScene };
